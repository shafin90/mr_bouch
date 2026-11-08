/* eslint-disable */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { NodeViewProps, ReactNodeViewRenderer, useEditor, EditorContent, NodeViewWrapper } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Youtube from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { createClient } from "@/lib/supabase/client";
import "./editor.css";

function ResizableImageView({ node, selected, updateAttributes }: NodeViewProps) {
  const storedWidth = Number(node.attrs.width) || null;
  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  const resizeState = useRef<{ startX: number; startWidth: number; maxWidth: number; currentWidth: number } | null>(null);
  const displayedWidth = previewWidth ?? storedWidth;

  function onResizeStart(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const wrapper = event.currentTarget.parentElement;
    const image = wrapper?.querySelector("img");
    const editor = wrapper?.closest(".tiptap");
    const startWidth = image?.getBoundingClientRect().width ?? wrapper?.getBoundingClientRect().width ?? 320;
    const maxWidth = editor?.getBoundingClientRect().width ?? startWidth;
    resizeState.current = { startX: event.clientX, startWidth, maxWidth, currentWidth: startWidth };
    setPreviewWidth(startWidth);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onResizeMove(event: React.PointerEvent<HTMLButtonElement>) {
    const state = resizeState.current;
    if (!state) return;
    const nextWidth = Math.round(Math.max(80, Math.min(state.maxWidth, state.startWidth + event.clientX - state.startX)));
    state.currentWidth = nextWidth;
    setPreviewWidth(nextWidth);
  }

  function onResizeEnd(event: React.PointerEvent<HTMLButtonElement>) {
    const state = resizeState.current;
    if (!state) return;
    updateAttributes({ width: Math.round(state.currentWidth) });
    resizeState.current = null;
    setPreviewWidth(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function onResizeKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const wrapper = event.currentTarget.parentElement;
    const image = wrapper?.querySelector("img");
    const editorWidth = wrapper?.closest(".tiptap")?.getBoundingClientRect().width ?? 320;
    const current = image?.getBoundingClientRect().width ?? 320;
    const delta = event.key === "ArrowRight" ? 32 : -32;
    updateAttributes({ width: Math.round(Math.max(80, Math.min(editorWidth, current + delta))) });
  }

  return (
    <NodeViewWrapper
      className={`resizable-image-node${selected ? " is-selected" : ""}`}
      style={{ width: displayedWidth ? `${displayedWidth}px` : "max-content" }}
      data-resized-width={storedWidth || undefined}
    >
      <img src={node.attrs.src} alt={node.attrs.alt || ""} title={node.attrs.title || undefined} draggable={false} />
      {selected && (
        <button
          type="button"
          className="image-resize-handle"
          contentEditable={false}
          title="Faites glisser pour redimensionner · utilisez les flèches du clavier"
          aria-label={`Redimensionner l’image${displayedWidth ? `, ${Math.round(displayedWidth)} pixels` : ""}`}
          onPointerDown={onResizeStart}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
          onPointerCancel={onResizeEnd}
          onKeyDown={onResizeKeyDown}
        />
      )}
    </NodeViewWrapper>
  );
}

const ResizableImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute("width");
          return value ? Number.parseInt(value, 10) || null : null;
        },
        renderHTML: (attributes) => attributes.width ? { width: attributes.width } : {},
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  CodeXml,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Undo2,
  Redo2,
  RemoveFormatting,
  Maximize2,
  Minimize2,
  Eye,
  Edit3,
  Code2,
  HelpCircle,
  Subscript as SubIcon,
  Superscript as SuperIcon,
  Palette,
  Highlighter,
  UploadCloud,
  Check,
  X,
  Trash2,
  Plus,
  Clock,
  FileText
} from "lucide-react";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  articleTitle?: string;
  category?: string;
  onUploadImage?: (file: File) => Promise<string | null>;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Rédigez votre article, vos réflexions ou vos actualités avec tout le confort moderne...",
  minHeight = "420px",
  articleTitle,
  category,
  onUploadImage,
}: RichTextEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "html">("edit");
  const [htmlSource, setHtmlSource] = useState(value);

  // Modals / Popups
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkBlank, setLinkBlank] = useState(true);

  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const [showColorPopover, setShowColorPopover] = useState(false);
  const [showHighlightPopover, setShowHighlightPopover] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "editor-link",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CharacterCount,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Youtube.configure({
        inline: false,
        width: 640,
        height: 360,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setHtmlSource(html);
    },
    immediatelyRender: false,
  });

  // Sync value changes from parent if updated outside
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
      setHtmlSource(value);
    }
  }, [value, editor]);

  // Handle escape for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  if (!editor) {
    return (
      <div className="flex h-64 items-center justify-center border border-border bg-white text-slate">
        Chargement de l'éditeur...
      </div>
    );
  }

  // Live word & read time calculation
  const words = editor.storage.characterCount?.words?.() ?? 0;
  const characters = editor.storage.characterCount?.characters?.() ?? 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  // Link actions
  const openLinkModal = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );
    setLinkUrl(previousUrl);
    setLinkText(selectedText);
    setLinkBlank(true);
    setShowLinkModal(true);
  };

  const applyLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkModal(false);
      return;
    }

    let formattedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl) && !formattedUrl.startsWith("mailto:") && !formattedUrl.startsWith("#")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (linkText && editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${formattedUrl}" target="${linkBlank ? "_blank" : "_self"}">${linkText}</a>`)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({
          href: formattedUrl,
          target: linkBlank ? "_blank" : "_self",
        })
        .run();
    }
    setShowLinkModal(false);
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setShowLinkModal(false);
  };

  // Image actions
  const handleDirectImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      let finalUrl: string | null = null;
      if (onUploadImage) {
        finalUrl = await onUploadImage(file);
      } else {
        const supabase = createClient();
        const path = `news/editor-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const { error } = await supabase.storage.from("media").upload(path, file);
        if (!error) {
          const { data } = supabase.storage.from("media").getPublicUrl(path);
          finalUrl = data.publicUrl;
        }
      }

      if (finalUrl) {
        editor.chain().focus().setImage({ src: finalUrl, alt: file.name }).run();
        setShowImageModal(false);
        setImageUrl("");
        setImageAlt("");
      } else {
        // Fallback to data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            editor.chain().focus().setImage({ src: result, alt: file.name }).run();
            setShowImageModal(false);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const applyImageUrl = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim(), alt: imageAlt.trim() || undefined }).run();
      setShowImageModal(false);
      setImageUrl("");
      setImageAlt("");
    }
  };

  // Video embed action
  const applyVideo = () => {
    if (videoUrl.trim()) {
      editor.commands.setYoutubeVideo({
        src: videoUrl.trim(),
      });
      setShowVideoModal(false);
      setVideoUrl("");
    }
  };

  // Color options
  const textColors = [
    { label: "Défaut (Marine)", color: "#0F2433" },
    { label: "Bronze Signature", color: "#B99A62" },
    { label: "Ardoise Douce", color: "#64748B" },
    { label: "Carmin Sombre", color: "#991B1B" },
    { label: "Vert Forêt", color: "#166534" },
    { label: "Bleu Nuit", color: "#1E40AF" },
  ];

  const highlightColors = [
    { label: "Jaune Soleil", color: "#FEF08A" },
    { label: "Bronze Doré", color: "#FDE68A" },
    { label: "Menthe Fraîche", color: "#BBF7D0" },
    { label: "Ciel Pur", color: "#BAE6FD" },
    { label: "Rose Pâle", color: "#FECDD3" },
  ];

  // Sync HTML code view changes back to editor
  const handleHtmlCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtmlSource(newHtml);
    onChange(newHtml);
    editor.commands.setContent(newHtml, { emitUpdate: false });
  };

  return (
    <div className={`editor-root border border-border bg-white shadow-soft transition-all duration-200 ${isFullscreen ? "is-fullscreen" : "relative"}`}>
      {/* Top Header Bar: Mode & Fullscreen */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-[#F8FAFC] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate">Éditeur :</span>
          <div className="flex rounded-md border border-border bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "edit" ? "bg-navy text-white shadow-xs" : "text-slate hover:text-navy"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Rédaction
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "preview" ? "bg-navy text-white shadow-xs" : "text-slate hover:text-navy"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Aperçu en direct
            </button>
            <button
              type="button"
              onClick={() => setViewMode("html")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "html" ? "bg-navy text-white shadow-xs" : "text-slate hover:text-navy"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Code HTML
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Shortcuts helper */}
          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            title="Raccourcis clavier"
            className="flex items-center gap-1 rounded border border-border bg-white px-2 py-1 text-xs text-slate hover:border-navy hover:text-navy"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Raccourcis</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Quitter le plein écran (Échap)" : "Mode Plein Écran sans distraction"}
            className="flex items-center gap-1.5 rounded border border-border bg-white px-2.5 py-1 text-xs font-medium text-navy shadow-2xs hover:bg-slate-50"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Quitter Plein Écran</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Plein Écran Zen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Formatting Toolbar (Visible in edit mode) */}
      {viewMode === "edit" && (
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 border-b border-border bg-white px-3 py-2 text-navy shadow-xs">
          {/* Undo / Redo */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Annuler (Ctrl+Z)"
              className="rounded p-1.5 text-slate transition hover:bg-slate-100 hover:text-navy disabled:opacity-30"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Rétablir (Ctrl+Y)"
              className="rounded p-1.5 text-slate transition hover:bg-slate-100 hover:text-navy disabled:opacity-30"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Block Level Hierarchy */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
              title="Paragraphe normal"
              className={`rounded px-2 py-1 text-xs font-medium transition ${
                editor.isActive("paragraph") && !editor.isActive("heading")
                  ? "bg-navy text-white"
                  : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <Pilcrow className="inline h-3.5 w-3.5 mr-0.5" /> Texte
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="Titre 1 (Principal)"
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-navy text-white"
                  : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Titre 2 (Section)"
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-navy text-white"
                  : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              title="Titre 3 (Sous-section)"
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                editor.isActive("heading", { level: 3 })
                  ? "bg-navy text-white"
                  : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              title="Titre 4"
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                editor.isActive("heading", { level: 4 })
                  ? "bg-navy text-white"
                  : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              H4
            </button>
          </div>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Inline Styles */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Gras (Ctrl+B)"
              className={`rounded p-1.5 transition ${
                editor.isActive("bold") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italique (Ctrl+I)"
              className={`rounded p-1.5 transition ${
                editor.isActive("italic") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Souligné (Ctrl+U)"
              className={`rounded p-1.5 transition ${
                editor.isActive("underline") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Barré"
              className={`rounded p-1.5 transition ${
                editor.isActive("strike") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <Strikethrough className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="Code en ligne"
              className={`rounded p-1.5 transition ${
                editor.isActive("code") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <Code className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              title="Indice"
              className={`rounded p-1.5 transition ${
                editor.isActive("subscript") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <SubIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              title="Exposant"
              className={`rounded p-1.5 transition ${
                editor.isActive("superscript") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <SuperIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Color & Highlight */}
          <div className="relative flex items-center gap-0.5">
            {/* Text Color */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowColorPopover(!showColorPopover);
                  setShowHighlightPopover(false);
                }}
                title="Couleur du texte"
                className="flex items-center gap-1 rounded p-1.5 text-slate transition hover:bg-slate-100 hover:text-navy"
              >
                <Palette className="h-4 w-4" />
              </button>
              {showColorPopover && (
                <div className="absolute left-0 top-full z-30 mt-1 flex flex-col gap-1 rounded-md border border-border bg-white p-2 shadow-lg min-w-[160px]">
                  <p className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-1">Couleur texte</p>
                  {textColors.map((tc) => (
                    <button
                      key={tc.color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().setColor(tc.color).run();
                        setShowColorPopover(false);
                      }}
                      className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-slate-100 text-left"
                    >
                      <span className="h-3 w-3 rounded-full border border-slate-300" style={{ backgroundColor: tc.color }} />
                      <span>{tc.label}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().unsetColor().run();
                      setShowColorPopover(false);
                    }}
                    className="mt-1 border-t border-border pt-1 text-left text-xs text-red-600 hover:underline px-2"
                  >
                    Réinitialiser
                  </button>
                </div>
              )}
            </div>

            {/* Highlight */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowHighlightPopover(!showHighlightPopover);
                  setShowColorPopover(false);
                }}
                title="Surlignage"
                className={`rounded p-1.5 transition ${
                  editor.isActive("highlight") ? "bg-amber-100 text-amber-900" : "text-slate hover:bg-slate-100 hover:text-navy"
                }`}
              >
                <Highlighter className="h-4 w-4" />
              </button>
              {showHighlightPopover && (
                <div className="absolute left-0 top-full z-30 mt-1 flex flex-col gap-1 rounded-md border border-border bg-white p-2 shadow-lg min-w-[160px]">
                  <p className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-1">Surlignage</p>
                  {highlightColors.map((hc) => (
                    <button
                      key={hc.color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().toggleHighlight({ color: hc.color }).run();
                        setShowHighlightPopover(false);
                      }}
                      className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-slate-100 text-left"
                    >
                      <span className="h-3 w-3 rounded-full border border-slate-300" style={{ backgroundColor: hc.color }} />
                      <span>{hc.label}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run();
                      setShowHighlightPopover(false);
                    }}
                    className="mt-1 border-t border-border pt-1 text-left text-xs text-red-600 hover:underline px-2"
                  >
                    Effacer surlignage
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              title="Aligner à gauche"
              className={`rounded p-1.5 transition ${
                editor.isActive({ textAlign: "left" }) ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              title="Centrer"
              className={`rounded p-1.5 transition ${
                editor.isActive({ textAlign: "center" }) ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              title="Aligner à droite"
              className={`rounded p-1.5 transition ${
                editor.isActive({ textAlign: "right" }) ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <AlignRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              title="Justifier"
              className={`rounded p-1.5 transition ${
                editor.isActive({ textAlign: "justify" }) ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <AlignJustify className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Lists & Quotes */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Liste à puces"
              className={`rounded p-1.5 transition ${
                editor.isActive("bulletList") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Liste numérotée"
              className={`rounded p-1.5 transition ${
                editor.isActive("orderedList") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              title="Liste de tâches / Checklist"
              className={`rounded p-1.5 transition ${
                editor.isActive("taskList") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <ListChecks className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Citation éditoriale"
              className={`rounded p-1.5 transition ${
                editor.isActive("blockquote") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <Quote className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Bloc de code"
              className={`rounded p-1.5 transition ${
                editor.isActive("codeBlock") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <CodeXml className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Ligne séparatrice"
              className="rounded p-1.5 text-slate transition hover:bg-slate-100 hover:text-navy"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Media & Links */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={openLinkModal}
              title="Insérer / Modifier un lien"
              className={`rounded p-1.5 transition ${
                editor.isActive("link") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
              }`}
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            {editor.isActive("link") && (
              <button
                type="button"
                onClick={removeLink}
                title="Supprimer le lien"
                className="rounded p-1.5 text-red-600 transition hover:bg-red-50"
              >
                <Unlink className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              title="Insérer une image (téléversement ou URL)"
              className="rounded p-1.5 text-slate transition hover:bg-slate-100 hover:text-navy"
            >
              <ImageIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowVideoModal(true)}
              title="Intégrer une vidéo YouTube"
              className="rounded p-1.5 text-slate transition hover:bg-slate-100 hover:text-navy"
            >
              <Video className="h-4 w-4" />
            </button>

            {/* Table Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTableMenu(!showTableMenu)}
                title="Tableaux"
                className={`rounded p-1.5 transition ${
                  editor.isActive("table") ? "bg-navy text-white" : "text-slate hover:bg-slate-100 hover:text-navy"
                }`}
              >
                <TableIcon className="h-4 w-4" />
              </button>

              {showTableMenu && (
                <div className="absolute right-0 top-full z-30 mt-1 flex w-52 flex-col gap-1 rounded-md border border-border bg-white p-2 shadow-lg">
                  <p className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-1">Options tableau</p>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                      setShowTableMenu(false);
                    }}
                    className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-slate-100 text-left"
                  >
                    <Plus className="h-3.5 w-3.5" /> Insérer tableau (3x3)
                  </button>
                  {editor.isActive("table") && (
                    <>
                      <div className="my-1 border-t border-border" />
                      <button
                        type="button"
                        onClick={() => {
                          editor.chain().focus().addRowAfter().run();
                          setShowTableMenu(false);
                        }}
                        className="rounded px-2 py-1 text-xs hover:bg-slate-100 text-left"
                      >
                        + Ajouter ligne dessous
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          editor.chain().focus().deleteRow().run();
                          setShowTableMenu(false);
                        }}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 text-left"
                      >
                        - Supprimer ligne
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          editor.chain().focus().addColumnAfter().run();
                          setShowTableMenu(false);
                        }}
                        className="rounded px-2 py-1 text-xs hover:bg-slate-100 text-left"
                      >
                        + Ajouter colonne à droite
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          editor.chain().focus().deleteColumn().run();
                          setShowTableMenu(false);
                        }}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 text-left"
                      >
                        - Supprimer colonne
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          editor.chain().focus().toggleHeaderRow().run();
                          setShowTableMenu(false);
                        }}
                        className="rounded px-2 py-1 text-xs hover:bg-slate-100 text-left"
                      >
                        Basculer en-tête
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          editor.chain().focus().deleteTable().run();
                          setShowTableMenu(false);
                        }}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 text-left font-medium"
                      >
                        Supprimer tout le tableau
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Effacer toute la mise en forme"
            className="rounded p-1.5 text-slate transition hover:bg-slate-100 hover:text-navy"
          >
            <RemoveFormatting className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className={`editor-scroll-area ${isFullscreen ? "" : "p-4 sm:p-6"}`}>
        {viewMode === "edit" && (
          <div style={{ minHeight }} className="cursor-text">
            <EditorContent editor={editor} className="tiptap prose max-w-none focus:outline-none" />
            <p className="mt-3 text-xs text-slate-500">Sélectionnez une image, puis faites glisser la poignée en bas à droite pour la redimensionner. Les flèches du clavier permettent un réglage précis.</p>
          </div>
        )}

        {viewMode === "preview" && (
          <div className="mx-auto max-w-3xl rounded-md border border-border bg-[#FBF9F3] p-8 shadow-xs">
            <div className="mb-6 border-b border-border pb-6">
              {category && (
                <span className="inline-block rounded-full bg-bronze/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-bronze mb-3">
                  {category}
                </span>
              )}
              <h1 className="font-display text-3xl font-light text-navy md:text-4xl">
                {articleTitle || "Titre de l'article"}
              </h1>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {readingTime} min de lecture
                </span>
                <span>•</span>
                <span>{words} mots</span>
              </div>
            </div>

            {/* Live rendered HTML content */}
            <div
              className="article-prose leading-relaxed"
              dangerouslySetInnerHTML={{ __html: editor.getHTML() || "<p class='italic text-slate'>Aucun contenu rédigé pour le moment.</p>" }}
            />
          </div>
        )}

        {viewMode === "html" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate">
              <span>Code source HTML brut (modifiable en temps réel)</span>
              <span>{htmlSource.length} caractères</span>
            </div>
            <textarea
              value={htmlSource}
              onChange={handleHtmlCodeChange}
              className="w-full rounded-md border border-border bg-slate-900 p-4 font-mono text-sm text-slate-100 focus:border-navy focus:outline-none"
              rows={18}
            />
          </div>
        )}
      </div>

      {/* Bottom Status & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between border-t border-border bg-[#F8FAFC] px-4 py-2 text-xs text-slate">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-medium text-navy">
            <FileText className="h-3.5 w-3.5 text-bronze" /> {words.toLocaleString()} mots
          </span>
          <span>•</span>
          <span>{characters.toLocaleString()} caractères</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate" /> ~{readingTime} min de lecture
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">Éditeur enrichi pour blogs & presse</span>
          {isFullscreen && (
            <span className="rounded bg-navy/10 px-2 py-0.5 text-[10px] font-semibold text-navy">
              Mode Plein Écran
            </span>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg text-navy">Insérer / Modifier un lien</h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="rounded p-1 text-slate hover:bg-slate-100 hover:text-navy"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                  Adresse URL (ex: https://exemple.com)
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded border border-border px-3 py-2 text-sm text-navy focus:border-navy focus:outline-none"
                  autoFocus
                />
              </div>

              {editor.state.selection.empty && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                    Texte à afficher
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="En savoir plus"
                    className="w-full rounded border border-border px-3 py-2 text-sm text-navy focus:border-navy focus:outline-none"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 text-xs text-navy cursor-pointer">
                <input
                  type="checkbox"
                  checked={linkBlank}
                  onChange={(e) => setLinkBlank(e.target.checked)}
                  className="rounded text-bronze"
                />
                Ouvrir dans un nouvel onglet (recommandé)
              </label>

              <div className="flex items-center justify-between pt-2">
                {editor.isActive("link") ? (
                  <button
                    type="button"
                    onClick={removeLink}
                    className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer le lien
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="rounded border border-border px-3 py-1.5 text-xs text-slate hover:bg-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={applyLink}
                    className="flex items-center gap-1.5 rounded bg-navy px-4 py-1.5 text-xs font-medium text-white hover:bg-navy-deep"
                  >
                    <Check className="h-3.5 w-3.5" /> Valider
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg border border-border bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg text-navy">Insérer une image dans l'article</h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="rounded p-1 text-slate hover:bg-slate-100 hover:text-navy"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-5">
              {/* Option A: Direct File Upload */}
              <div className="rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-bronze">
                <UploadCloud className="mx-auto h-8 w-8 text-bronze" />
                <p className="mt-2 text-sm font-medium text-navy">Téléverser depuis votre appareil</p>
                <p className="mt-1 text-xs text-slate">PNG, JPG, WEBP jusqu'à 10 Mo</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDirectImageUpload(file);
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="mt-3 inline-flex items-center gap-1.5 rounded bg-navy px-4 py-1.5 text-xs font-medium text-white hover:bg-navy-deep disabled:opacity-50"
                >
                  {uploadingImage ? "Téléversement en cours..." : "Choisir un fichier"}
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <span className="bg-white px-2 text-xs uppercase tracking-wider text-slate">OU par URL web</span>
              </div>

              {/* Option B: Image URL */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                    Adresse URL de l'image
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded border border-border px-3 py-2 text-sm text-navy focus:border-navy focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                    Description textuelle (alt text / accessibilité)
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="ex: Touré Ahmed Bouah lors de la conférence..."
                    className="w-full rounded border border-border px-3 py-2 text-sm text-navy focus:border-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="rounded border border-border px-3 py-1.5 text-xs text-slate hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={applyImageUrl}
                  disabled={!imageUrl.trim()}
                  className="flex items-center gap-1.5 rounded bg-navy px-4 py-1.5 text-xs font-medium text-white hover:bg-navy-deep disabled:opacity-40"
                >
                  <Check className="h-3.5 w-3.5" /> Insérer l'image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg text-navy">Intégrer une vidéo YouTube</h3>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="rounded p-1 text-slate hover:bg-slate-100 hover:text-navy"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                  Lien de la vidéo YouTube
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded border border-border px-3 py-2 text-sm text-navy focus:border-navy focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="rounded border border-border px-3 py-1.5 text-xs text-slate hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={applyVideo}
                  disabled={!videoUrl.trim()}
                  className="flex items-center gap-1.5 rounded bg-navy px-4 py-1.5 text-xs font-medium text-white hover:bg-navy-deep disabled:opacity-40"
                >
                  <Check className="h-3.5 w-3.5" /> Intégrer le lecteur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg border border-border bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg text-navy">Raccourcis Clavier & Confort de Rédaction</h3>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="rounded p-1 text-slate hover:bg-slate-100 hover:text-navy"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-slate">Gras</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-navy">Ctrl + B</kbd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-slate">Italique</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-navy">Ctrl + I</kbd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-slate">Souligné</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-navy">Ctrl + U</kbd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-slate">Barré</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-navy">Ctrl + Shift + X</kbd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-slate">Code en ligne</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-navy">Ctrl + E</kbd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-slate">Insérer un lien</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-navy">Bouton Lien</kbd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-slate">Annuler</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-navy">Ctrl + Z</kbd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-slate">Rétablir</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-navy">Ctrl + Y</kbd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-slate">Liste à puces</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-navy">Ctrl + Shift + 8</kbd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-slate">Liste numérotée</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-navy">Ctrl + Shift + 7</kbd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-slate">Citation</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-navy">Ctrl + Shift + B</kbd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-slate">Plein écran</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-navy">Échap pour quitter</kbd>
              </div>
            </div>

            <div className="mt-5 rounded-md bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
              💡 <strong>Astuce Markdown :</strong> Vous pouvez taper <code className="rounded bg-amber-100 px-1"># </code> pour un titre 1, <code className="rounded bg-amber-100 px-1">## </code> pour un titre 2, <code className="rounded bg-amber-100 px-1">- </code> pour une puce, et <code className="rounded bg-amber-100 px-1">&gt; </code> pour une citation !
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="rounded bg-navy px-4 py-1.5 text-xs font-medium text-white hover:bg-navy-deep"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
