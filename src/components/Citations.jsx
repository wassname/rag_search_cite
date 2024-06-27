import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Alert from 'react-bootstrap/Alert';
// import dangerouslySetInnerHTML from 'react';
import markdownIt from 'markdown-it';
import { escapeHtml } from "markdown-it/lib/common/utils.mjs";
const markdowner = new markdownIt();

// function escapeHtml(text) {
//   return text
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;')
//     .replace(/'/g, '&#039;');
// }

function doc2htmlref(d, n) {
  const tooltip = escapeHtml(`${d.name}:\n\n${d.content}\n\n${d.url}`).trim();
  return `<a href="${d.url}"><span title="${tooltip}">${n}</span></a>`;
}

function formatAns(ans, docs) {
  // Convert markdown to HTML
  ans = escapeHtml(ans);
  ans = markdowner.render(ans);
  let text2 = '<h3>Answer</h3>' + ans;

  // Convert [1], [1,3] etc to references with tooltips
  const pattern = /\[\s*((?:\d+\s*(?:,\s*\d+\s*)*)?)\]/g;
  let matches = [...text2.matchAll(pattern)].reverse();
  for (const match of matches) {
    const m = match[0].replace('[', '').replace(']', '');
    const ns = m.split(', ');
    let m2 = '';
    for (const n of ns) {
      const d = docs[parseInt(n, 10)-1];
      m2 += `${doc2htmlref(d, n)}, `;
    }
    m2 = `[${m2.slice(0, -2)}]`;
    const [s0, s1] = [match.index, match.index + match[0].length];
    text2 = text2.slice(0, s0) + m2 + text2.slice(s1);
  }

  // Turn matches into a list of integers for used references
  const refs = matches.map(m => m[0].replace('[', '').replace(']', '').trim().split(', ')).flat();
  const uniqueRefs = [...new Set(refs.map(m => parseInt(m, 10)))].sort((a, b) => a - b);

  // HTML list references
  text2 += "<p/><p/><h3>References:</h3><p/>";
  for (const r of uniqueRefs) {
    const d = docs[r-1];
    text2 += `<li><a href="${d.url}">[${r}]</a>: ${escapeHtml(d.name)} - ${escapeHtml(d.content)}</li>`;
  }

  return text2;
}

export default function Citation({ name, value, docs }) {

    value = formatAns(value, docs)

    return <Form.Group>      
      <Form.Label htmlFor={name} label={name} />
      <div dangerouslySetInnerHTML={{ __html: value }}></div>
    </Form.Group>
  }
