
// regex help from
// https://stackoverflow.com/a/23667311
// https://zserge.com/posts/js-editor/
// https://www.aspsnippets.com/Articles/Regular-Expression-Regex-to-allow-both-decimals-as-well-as-integers-and-Regex-for-allowing-any-decimal-number.aspx

const keywords =
"print|new|if|else|do|while|switch|for|in|of|continue|break|return|typeof|function|var|const|let";

const keywordNotQuotedRegex = new RegExp(`("[^"]+")|('[^']+')|\\b(` + keywords + `)(?=[^\\w])`, "g");
const numberNotQuotedRegex = new RegExp(`("[^"]+")|('[^']+')|\\b((\\d+)(\\.\\d+)?)`, "g");
const singleQuotedRegex = new RegExp(`('[^']+')`, "g");
const doubleQuotedRegex = new RegExp(`("[^"]+")`, "g");


const template = document.createElement("template");

template.innerHTML =
`<style>
    .highlighter-keyword {
        font-weight: var(--highlighter-keyword-font-weight, bold);
        font-style: var(--highlighter-keyword-font-style, inherit);
        color: var(--highlighter-keyword-color, inherit);
    }

    .highlighter-comment {
        font-weight: var(--highlighter-comment-font-weight, inherit);
        font-style: var(--highlighter-comment-font-style, italic);
        color: var(--highlighter-comment-color, grey);
    }

    .highlighter-string-singleQuote {
        font-weight: var(--highlighter-string-singleQuote-font-weight, inherit);
        font-style: var(--highlighter-string-singleQuote-font-style, inherit);
        color: var(--highlighter-string-singleQuote-color, green);
    }

    .highlighter-string-doubleQuote {
        font-weight: var(--highlighter-string-doubleQuote-font-weight, inherit);
        font-style: var(--highlighter-string-doubleQuote-font-style, inherit);
        color: var(--highlighter-string-doubleQuote-color, green);
    }

    .highlighter-number {
        font-weight: var(--highlighter-number-font-weight, inherit);
        font-style: var(--highlighter-number-font-style, inherit);
        color: var(--highlighter-number-color, red);
    }
</style>
`;

class Highlighter {

    constructor(opts = {}) {

        const defaults = {
            className: "highlighter",
            theme: "plain",
            language: null
        };

        this.className = defaults.className || opts.className;
        this.theme = defaults.theme || opts.theme;
        this.language = defaults.language || opts.language;
    }

    _span(string, type) {
        return `<span class=${this.className + "-" + type}>${string}</span>`;
    }

    _highlightKeyword(string) {
        return this._span(string, "keyword");
    }

    _highlightNumber(string) {
        return this._span(string, "number");
    }

    _highlightComment(string) {
        return this._span(string, "comment");
    }

    _highlightSingleQuote(string) {
        return this._span(string, "string-singleQuote");
    }

    _highlightDoubleQuote(string) {
        return this._span(string, "string-doubleQuote");
    }

    _highlightSyntax(line) {

        // comments override other styles
        if (line.includes("//")) {
            let linePortions = line.split("//");
            linePortions[0] = this._highlightSyntax(linePortions[0]);
            for (let i = 1; i < linePortions.length; i++) {
                linePortions[i] = this._highlightComment("//" + linePortions[i]);
            }
            return linePortions.join("");
        }

        line = line.

            replace(singleQuotedRegex, this._highlightSingleQuote(`$1`)).
            replace(doubleQuotedRegex, this._highlightDoubleQuote(`$1`)).

            replace(keywordNotQuotedRegex, (m, group1, group2) => {
                if (!group1 && !group2) {
                    return this._highlightKeyword(m);
                } else {
                    return m;
                }
            }).

            replace(numberNotQuotedRegex, (m, group1, group2) => {
                if (!group1 && !group2) {
                    return this._highlightNumber(m);
                } else {
                    return m;
                }
            })

        return line;

    }

    _highlightLines(string) {
        const lines = string.split("\n");
        for (let i = 0; i < lines.length; i++) {
            lines[i] = this._highlightSyntax(lines[i]);
        }

        return lines.join("\n");
    }

    highlight(string) {
        var multiLineOpen = string.indexOf("/*");

        if (multiLineOpen !== -1) {
            var result = "";
            var index = 0;

            while (multiLineOpen !== -1) {
                result += this._highlightLines(string.substring(index, multiLineOpen));
                let multiLineClose = string.indexOf("*/", multiLineOpen);
                if (multiLineClose === -1 ) {
                    return this._highlightLines(string);
                } else {
                    multiLineClose += 2;
                }
                result += this._highlightComment(string.substring(multiLineOpen, multiLineClose));
                multiLineOpen = string.indexOf("/*", multiLineClose);
                index = multiLineClose;
            }

            result += this._highlightLines(string.substring(index, string.length));
            return result;
        } else {
            return this._highlightLines(string);
        }
    }

    getStyleTemplate() {
        return template;
    }
}

export {Highlighter};