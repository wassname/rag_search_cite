
import React, { Component } from 'react';
import * as jsdiff from 'diff-match-patch';

/**
 * Convert a diff array into a pretty HTML report.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} HTML representation.
 */
function diff2react (diffs) {
    const text = diffs.map(
        ([op, data], i) => {
            switch (op) {
                case jsdiff.DIFF_INSERT:
                    return <ins key={i}>{data}</ins>;
                case jsdiff.DIFF_DELETE:
                    return <del key={i} >{data}</del>;
                case jsdiff.DIFF_EQUAL:
                    return <span key={i}>{data}</span>;
            }
        }
    )
    return <pre className='Difference'>{text}</pre>
};

// function diff2md (diffs) {
//     const text = diffs.map(
//         ([op, data]) => {
//             if (op in [jsdiff.DIFF_INSERT, jsdiff.DIFF_DELETE]) {
//                 if (data.trim().length > 0) {
//                     data = data.trim()
//                 }
//             }
//             switch (op) {
//                 case jsdiff.DIFF_INSERT:
//                     return `<ins>${data}</ins>`;
//                 case jsdiff.DIFF_DELETE:
//                     return `<del>${data}</del>`;
//                 case jsdiff.DIFF_EQUAL:
//                     return data
//             }
//         }
//     )
//     return text.join('');
// };

// function patchmd2 (patches) {
//     const text = patches.map(r=>r.diffs).map(diff2md)
//     return text.map((s, i)=>`- [${i}]: \`${s}\``).join('\n');
// };
const reverseString = str => [...str].reverse().join('');

export default function Diff(props) {
    let dmp = new jsdiff.diff_match_patch();
    // I want to match from the end, as this work best wit Chain Of Thought
    let diff = dmp.diff_main(reverseString(props.inputA), reverseString(props.inputB));
    // reverse arrays and contents
    diff = diff.reverse().map(([op, data]) => [op, reverseString(data)]);
    dmp.diff_cleanupSemantic(diff);
    // const patches = dmp.patch_make(props.inputA, diff)
    // const patch2 = patchmd2(patches) 
    // console.log(patch2)
    return diff2react(diff);
    // const result = diff_prettyHtml(diff);
    // return <div className={props.className}>{result}</div>;
}
    
