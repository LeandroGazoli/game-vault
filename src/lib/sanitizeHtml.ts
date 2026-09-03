import DOMPurify from "isomorphic-dompurify";

export function sanitizeCustomHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  const clean = DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: [
      "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6",
      "b", "i", "strong", "em", "u", "s", "strike", "del", "mark",
      "ul", "ol", "li", "dl", "dt", "dd",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td",
      "img", "a", "br", "hr", "blockquote", "code", "pre",
      "figure", "figcaption", "center", "marquee", "details", "summary",
      "sub", "sup", "small", "big", "font"
    ],
    ALLOWED_ATTR: [
      "class", "src", "href", "alt", "title", "target", "rel",
      "width", "height", "align", "valign", "color", "face", "size",
      "border", "cellspacing", "cellpadding", "colspan", "rowspan"
    ],
    FORBID_TAGS: [
      "style", "script", "iframe", "object", "embed", "form", "input",
      "textarea", "button", "select", "option", "link", "meta",
      "base", "applet", "frame", "frameset"
    ],
    FORBID_ATTR: [
      "onload", "onerror", "onclick", "onmouseover", "onmouseout",
      "onfocus", "onblur", "onchange", "onsubmit", "onkeydown",
      "onkeyup", "onkeypress", "onmouseenter", "onmouseleave",
      "oncontextmenu", "ondblclick", "onwheel", "onscroll"
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
  });

  return clean;
}
