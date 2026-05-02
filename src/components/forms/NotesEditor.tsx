import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useApplicationStore } from '@/store/useApplicationStore';
import { useCallback } from 'react';

export function NotesEditor({ applicationId, initialContent }: { applicationId: number; initialContent: string }) {
  const { updateApplication } = useApplicationStore();

  const debouncedSave = useCallback(
    debounce((html: string) => updateApplication(applicationId, { notes: html }), 1000),
    [applicationId]
  );

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => debouncedSave(editor.getHTML()),
  });

  return <EditorContent editor={editor} className="prose max-w-none border rounded-lg p-3 min-h-32" />;
}

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}