import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useApplicationStore } from '@/store/useApplicationStore';
import { useRef } from 'react';

export function NotesEditor({ applicationId, initialContent }: { applicationId: number; initialContent: string }) {
  const { updateApplication } = useApplicationStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        updateApplication(applicationId, { notes: editor.getHTML() });
      }, 1000);
    },
  });

  return <EditorContent editor={editor} className="prose max-w-none border rounded-lg p-3 min-h-32" />;
}
