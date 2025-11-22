"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';

import {
  Bold, Italic, Strikethrough, Code,
  List, ListOrdered, Quote, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Link, Palette
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { TextStyle } from '@tiptap/extension-text-style';

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export default function TiptapEditor({ value, onChange }: Props) {
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  const addImage = useCallback(() => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageModal(false);
    }
  }, [editor, imageUrl]);

  const setLink = useCallback(() => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkModal(false);
    }
  }, [editor, linkUrl]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor?.chain().focus().setImage({ src: e.target?.result as string }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-xl min-h-[300px] p-4 bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Đang tải trình soạn thảo...</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">

        {/* History */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 hover:bg-blue-100 rounded-lg transition-all disabled:opacity-40 group"
            title="Undo"
          >
            <Undo className="w-4 h-4 group-hover:text-blue-600" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 hover:bg-blue-100 rounded-lg transition-all disabled:opacity-40 group"
            title="Redo"
          >
            <Redo className="w-4 h-4 group-hover:text-blue-600" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Headings */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive('heading', { level: 1 }) ? 'bg-purple-100 text-purple-600' : 'hover:bg-purple-100'
              }`}
            title="Tiêu đề 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive('heading', { level: 2 }) ? 'bg-purple-100 text-purple-600' : 'hover:bg-purple-100'
              }`}
            title="Tiêu đề 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive('heading', { level: 3 }) ? 'bg-purple-100 text-purple-600' : 'hover:bg-purple-100'
              }`}
            title="Tiêu đề 3"
          >
            H3
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'
              }`}
            title="In đậm"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'
              }`}
            title="In nghiêng"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'
              }`}
            title="Gạch ngang"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive('code') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'
              }`}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Lists */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive('bulletList') ? 'bg-green-100 text-green-600' : 'hover:bg-green-100'
              }`}
            title="Danh sách gạch đầu dòng"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive('orderedList') ? 'bg-green-100 text-green-600' : 'hover:bg-green-100'
              }`}
            title="Danh sách số"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive({ textAlign: 'left' }) ? 'bg-purple-100 text-purple-600' : 'hover:bg-purple-100'
              }`}
            title="Căn trái"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive({ textAlign: 'center' }) ? 'bg-purple-100 text-purple-600' : 'hover:bg-purple-100'
              }`}
            title="Căn giữa"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive({ textAlign: 'right' }) ? 'bg-purple-100 text-purple-600' : 'hover:bg-purple-100'
              }`}
            title="Căn phải"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive({ textAlign: 'justify' }) ? 'bg-purple-100 text-purple-600' : 'hover:bg-purple-100'
              }`}
            title="Căn đều"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Block Elements */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-lg transition-all group ${editor.isActive('blockquote') ? 'bg-orange-100 text-orange-600' : 'hover:bg-orange-100'
              }`}
            title="Trích dẫn"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowImageModal(true)}
            className="p-2 hover:bg-orange-100 rounded-lg transition-all group"
            title="Chèn ảnh"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowLinkModal(true)}
            className="p-2 hover:bg-orange-100 rounded-lg transition-all group"
            title="Chèn liên kết"
          >
            <Link className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Colors */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
            className="w-8 h-8 cursor-pointer rounded border border-gray-300"
            title="Màu chữ"
          />
          <button
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="p-2 hover:bg-red-100 rounded-lg transition-all text-xs"
            title="Xóa màu"
          >
            🧹
          </button>
        </div>

      </div>

      {/* Editor Content */}
      <div className="border-b border-gray-200">
        <EditorContent editor={editor} />
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 flex justify-between items-center">
        <div>
          <div>
            {editor?.getText().length || 0} ký tự
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Tiptap Editor
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Chèn ảnh</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nhập URL ảnh..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <div className="text-center text-gray-500">hoặc</div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Hủy
                </button>
                <button
                  onClick={addImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Chèn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Chèn liên kết</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nhập URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Hủy
                </button>
                <button
                  onClick={setLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Chèn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .ProseMirror {
          padding: 1rem;
          min-height: 300px;
          outline: none;
        }

        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
          color: #1f2937;
        }

        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
          color: #374151;
        }

        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0;
          color: #4b5563;
        }

        .ProseMirror p {
          margin: 1em 0;
        }

        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .ProseMirror code {
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }

        .editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}