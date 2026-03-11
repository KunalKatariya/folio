'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered,
  Quote, Code, Undo, Redo, Strikethrough
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlogEditorProps {
  content: string
  onChange: (html: string) => void
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors cursor-pointer',
        active
          ? 'text-amber-500'
          : 'hover:bg-[hsl(var(--muted))]'
      )}
      style={{
        background: active ? '#f59e0b18' : undefined,
        color: active ? '#f59e0b' : 'hsl(var(--muted-foreground))',
      }}
    >
      {children}
    </button>
  )
}

export function BlogEditor({ content, onChange }: BlogEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Begin your story here…',
      }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  })

  if (!editor) return null

  const wordCount = editor.storage.characterCount?.words() ?? 0

  return (
    <div className="rounded-2xl border overflow-hidden glass-card">
      {/* Toolbar */}
      <div
        className="flex items-center flex-wrap gap-0.5 px-4 py-2.5 border-b"
        style={{
          background: 'hsl(var(--muted))',
          borderColor: 'hsl(var(--border))',
        }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 mx-1 bg-[hsl(var(--border))]" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 mx-1 bg-[hsl(var(--border))]" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Code"
        >
          <Code className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 mx-1 bg-[hsl(var(--border))]" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="Undo"
        >
          <Undo className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="Redo"
        >
          <Redo className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="ml-auto text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {wordCount} words
        </div>
      </div>

      {/* Editor */}
      <div className="px-6 py-6" style={{ background: 'hsl(var(--card))' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
