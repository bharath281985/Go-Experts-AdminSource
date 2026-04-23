import { useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  AccessibilityHelp,
  Autoformat,
  AutoImage,
  Autosave,
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  Essentials,
  FindAndReplace,
  GeneralHtmlSupport,
  Heading,
  HorizontalLine,
  HtmlComment,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  Underline,
  Undo
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

type ToolbarPreset = 'full' | 'compact';

interface AdminRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  toolbarPreset?: ToolbarPreset;
}

const editorWrapperStyle = {
  '--ck-border-radius': '16px',
  '--ck-color-base-background': '#ffffff',
  '--ck-color-toolbar-background': '#f8fafc',
  '--ck-color-toolbar-border': '#e2e8f0',
  '--ck-color-base-border': '#e2e8f0',
  '--ck-color-focus-border': '#2563eb',
  '--ck-color-button-default-hover-background': '#eff6ff',
  '--ck-color-button-default-on-background': '#dbeafe',
  '--ck-color-button-default-on-hover-background': '#bfdbfe',
  '--ck-color-dropdown-panel-background': '#ffffff',
  '--ck-color-list-background': '#ffffff',
  '--ck-color-panel-background': '#ffffff',
  '--ck-color-input-background': '#ffffff',
  '--ck-color-shadow-drop': '0 20px 60px rgba(15, 23, 42, 0.12)',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  overflow: 'hidden',
  background: '#ffffff',
  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)'
} as React.CSSProperties;

const toolbarItemsByPreset: Record<ToolbarPreset, string[]> = {
  compact: [
    'heading',
    '|',
    'bold',
    'italic',
    'underline',
    'link',
    'bulletedList',
    'numberedList',
    'blockQuote',
    '|',
    'undo',
    'redo'
  ],
  full: [
    'undo',
    'redo',
    '|',
    'showBlocks',
    'findAndReplace',
    'selectAll',
    'sourceEditing',
    '|',
    'heading',
    '|',
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'subscript',
    'superscript',
    'code',
    'removeFormat',
    '|',
    'horizontalLine',
    'blockQuote',
    'specialCharacters',
    'link',
    'insertImage',
    'mediaEmbed',
    'insertTable',
    'htmlEmbed',
    '|',
    'bulletedList',
    'numberedList',
    'outdent',
    'indent',
    '|',
    'accessibilityHelp'
  ]
};

export function AdminRichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing here...',
  minHeight = 260,
  className = '',
  toolbarPreset = 'full'
}: AdminRichTextEditorProps) {
  const config = useMemo(
    () => ({
      licenseKey: 'GPL',
      plugins: [
        AccessibilityHelp,
        Autoformat,
        AutoImage,
        Autosave,
        BlockQuote,
        Bold,
        Code,
        Essentials,
        FindAndReplace,
        GeneralHtmlSupport,
        Heading,
        HorizontalLine,
        HtmlComment,
        HtmlEmbed,
        ImageBlock,
        ImageCaption,
        ImageInline,
        ImageInsert,
        ImageInsertViaUrl,
        ImageResize,
        ImageStyle,
        ImageToolbar,
        ImageUpload,
        Indent,
        IndentBlock,
        Italic,
        Link,
        LinkImage,
        List,
        ListProperties,
        MediaEmbed,
        Paragraph,
        PasteFromOffice,
        RemoveFormat,
        SelectAll,
        ShowBlocks,
        SourceEditing,
        SpecialCharacters,
        SpecialCharactersArrows,
        SpecialCharactersCurrency,
        SpecialCharactersEssentials,
        SpecialCharactersLatin,
        SpecialCharactersMathematical,
        SpecialCharactersText,
        Strikethrough,
        Subscript,
        Superscript,
        Table,
        TableCaption,
        TableCellProperties,
        TableColumnResize,
        TableProperties,
        TableToolbar,
        TextTransformation,
        Underline,
        Undo
      ],
      placeholder,
      toolbar: {
        items: toolbarItemsByPreset[toolbarPreset],
        shouldNotGroupWhenFull: false
      },
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
          { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
        ]
      },
      image: {
        toolbar: [
          'imageTextAlternative',
          '|',
          'toggleImageCaption',
          'imageStyle:inline',
          'imageStyle:block',
          'imageStyle:side',
          '|',
          'resizeImage'
        ]
      },
      table: {
        contentToolbar: [
          'tableColumn',
          'tableRow',
          'mergeTableCells',
          'tableProperties',
          'tableCellProperties'
        ]
      },
      list: {
        properties: {
          styles: true,
          startIndex: true,
          reversed: true
        }
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
        decorators: {
          downloadable: {
            mode: 'manual' as const,
            label: 'Downloadable',
            attributes: {
              download: 'file'
            }
          }
        }
      },
      htmlSupport: {
        allow: [
          {
            name: /.*/,
            attributes: true,
            classes: true,
            styles: true
          }
        ]
      },
      autosave: {
        save: async () => {}
      }
    }),
    [placeholder, toolbarPreset]
  );

  return (
    <div
      className={`admin-rich-text-editor ${className}`.trim()}
      style={{
        ...editorWrapperStyle,
        ['--admin-ck-min-height' as string]: `${minHeight}px`
      }}
    >
      <CKEditor
        editor={ClassicEditor}
        config={config as any}
        data={value}
        onChange={(_, editor) => onChange(editor.getData())}
      />
      <style>{`
        .admin-rich-text-editor {
          color: #0f172a;
        }
        .admin-rich-text-editor .ck.ck-toolbar {
          border: 0;
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 12px;
          background: #f8fafc;
        }
        .admin-rich-text-editor .ck.ck-content {
          min-height: var(--admin-ck-min-height);
          padding: 18px 20px;
          border: 0;
          background: #ffffff;
        }
        .admin-rich-text-editor .ck.ck-editor__main > .ck-editor__editable {
          min-height: var(--admin-ck-min-height);
        }
        .dark .admin-rich-text-editor .ck.ck-toolbar {
          background: #1a1a1a;
          border-bottom-color: #333333;
        }
        .dark .admin-rich-text-editor {
          --ck-color-base-background: #262626;
          --ck-color-toolbar-background: #1a1a1a;
          --ck-color-toolbar-border: #333333;
          --ck-color-base-border: #333333;
          --ck-color-focus-border: #2563eb;
          --ck-color-button-default-hover-background: #2b3440;
          --ck-color-button-default-on-background: #334155;
          --ck-color-button-default-on-hover-background: #475569;
          --ck-color-dropdown-panel-background: #1f1f1f;
          --ck-color-list-background: #1f1f1f;
          --ck-color-panel-background: #1f1f1f;
          --ck-color-input-background: #262626;
          background: #1f1f1f !important;
          border-color: #333333 !important;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
        }
        .dark .admin-rich-text-editor .ck.ck-editor__main > .ck-editor__editable,
        .dark .admin-rich-text-editor .ck.ck-content {
          background: #262626;
          color: #f5f5f5;
        }
        .dark .admin-rich-text-editor .ck.ck-button,
        .dark .admin-rich-text-editor .ck.ck-toolbar .ck.ck-toolbar__separator {
          color: #d4d4d4;
        }
        .dark .admin-rich-text-editor .ck.ck-button:hover {
          background: #333333;
        }
        .dark .admin-rich-text-editor .ck.ck-button.ck-on {
          background: #334155;
          color: #ffffff;
        }
        .dark .admin-rich-text-editor .ck.ck-placeholder::before {
          color: #737373;
        }
      `}</style>
    </div>
  );
}
