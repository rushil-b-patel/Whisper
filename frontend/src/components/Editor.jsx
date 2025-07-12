import { useEffect, useImperativeHandle, useRef, forwardRef, useId } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import LinkTool from '@editorjs/link';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import Embed from '@editorjs/embed';
import EditorjsList from '@editorjs/list';

const Editor = forwardRef((props, ref) => {
  const ejInstance = useRef();
  const uniqueId = useId();
  const holderId = props.holderId || `editorjs-${uniqueId}`;

  useImperativeHandle(ref, () => ({
    async save() {
      if (ejInstance.current) {
        return await ejInstance.current.save();
      }
      return null;
    },
  }));

  useEffect(() => {
    if (!ejInstance.current) {
      const editor = new EditorJS({
        holder: holderId,
        logLevel: 'ERROR',
        data: props.initialData || { blocks: [] },
        autofocus: true,
        tools: {
          linkTool: LinkTool,
          checklist: Checklist,
          embed: Embed,
          list: EditorjsList,
          header: {
            class: Header,
            config: {
              placeholder: 'Enter a header',
              levels: [1, 2, 3],
              defaultLevel: 1,
            },
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+Q',
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: "Quote's author",
            },
          },
        },
        onReady: () => {
          ejInstance.current = editor;
        },
      });
    }

    return () => {
      if (ejInstance.current?.destroy) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, [holderId, props.initialData]);

  return <div id={holderId} />;
});

export default Editor;

export const EditorRenderer = ({ data }) => {
  if (!data || !Array.isArray(data.blocks)) {
    return <p className="text-sm text-red-500">No valid content</p>;
  }

  const renderBlock = (block) => {
    const { id, type, data } = block;

    switch (type) {
      case 'header': {
        const Tag = `h${data?.level || 2}`;
        return (
          <Tag key={id} className="text-indigo-600 dark:text-indigo-400 font-bold mb-3">
            {data?.text || ''}
          </Tag>
        );
      }

      case 'paragraph':
        return (
          <p key={id} className="text-gray-800 dark:text-gray-200 font-mono mb-3 leading-relaxed">
            {typeof data?.text === 'string' ? data.text : '[Invalid paragraph]'}
          </p>
        );

      case 'checklist':
        return (
          <ul key={id} className="list-none space-y-2 mb-4">
            {(Array.isArray(data?.items) ? data.items : []).map((item, idx) => (
              <li
                key={idx}
                className={`pl-6 relative before:absolute before:left-0 before:top-1 before:w-4 before:h-4 before:rounded before:border ${
                  item.checked
                    ? 'before:bg-indigo-500 before:border-indigo-600'
                    : 'before:bg-white before:border-gray-400 dark:before:bg-gray-700'
                }`}
              >
                {typeof item.text === 'string' ? item.text : '[Invalid checklist item]'}
              </li>
            ))}
          </ul>
        );

      case 'list':
        return (
          <ul key={id} className="list-disc pl-5 mb-3">
            {(Array.isArray(data?.items) ? data.items : []).map((item, idx) => (
              <li key={idx}>
                {typeof item === 'string'
                  ? item
                  : typeof item?.content === 'string'
                    ? item.content
                    : '[Invalid list item]'}
              </li>
            ))}
          </ul>
        );

      case 'quote':
        return (
          <blockquote
            key={id}
            className="border-l-4 border-indigo-500 pl-4 italic text-gray-600 dark:text-gray-300 mb-2"
          >
            {data?.text || '[Empty quote]'}
            {data?.caption && (
              <footer className="mt-2 text-sm text-right text-gray-400">— {data.caption}</footer>
            )}
          </blockquote>
        );

      case 'embed':
        return (
          <div key={id} className="mb-4">
            <iframe
              title="Embedded content"
              src={data?.embed}
              width={data?.width || '100%'}
              height={data?.height || '300'}
              className="w-full rounded-lg border dark:border-gray-700"
              allowFullScreen
            />
            {data?.caption && (
              <p className="text-xs mt-2 text-center text-gray-500">{data.caption}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={id} className="text-sm text-yellow-500 mb-2">
            Unsupported block type: <code>{type}</code>
          </div>
        );
    }
  };

  return <div>{data.blocks.map(renderBlock)}</div>;
};
