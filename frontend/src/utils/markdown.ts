import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();
export const renderMarkdown = (text: string) => md.render(text);