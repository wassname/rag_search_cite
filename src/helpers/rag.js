import sendOpenAIMessage from "./openaiMessage";
import bingWebSearch from "./bingSearch";
import { escapeHtml } from "markdown-it/lib/common/utils.mjs";
import { HTMLarkdown } from 'htmlarkdown'

const defaultModel = 'gpt-3.5-turbo'

function rephrase(q, model = defaultModel) {
    let messages = [
        { role: "system", content: `You are LibrarianGPT an intelligence assisant that can improve users searching, helping them find documents they missed.  Please return only the search and no commentary.` },
        { role: "user", content: `Please draft an academic search query with synonyms and alternative phrases that will find documents to answer the following question: \"${q}\". Return only the search and no commentary.` },
    ]
    let r = sendOpenAIMessage(
        model,
        messages)
    return r

}

function exampleAnswer(q, model = defaultModel) {
    let messages = [
        { role: "system", content: `You are LibrarianGPT an intelligence assisant that can improve users searching by providing example answers that will help with vector based similarity search. Please return only the example and no commentary.` },
        { role: "user", content: `Please draft a concrete and concise example answer that ties together all elements of the following question in a paragraph or less: \"${q}\". Return only the example and no commentary.` },
    ]
    let r = sendOpenAIMessage(model, messages)
    return r
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // ES6 swap
    }
    return array;
}

function rank(query, r1, r2, r3, model = defaultModel) {
    let docs = [...r1, ...r2, ...r3];

    // deduplicate docs
    shuffleArray([...new Set(docs)])

    let num = docs.length;
    let messages = [
        { role: "system", content: `You are RankGPT, an intelligent assistant that can rank passages based on their relevancy to the query.` },
        { role: "user", content: `I will provide you with ${num} passages, each indicated by number identifier []. \nRank the passages based on their relevance to query: ${query}` },
        { role: "assistant", content: `Okay, please provide the ${num} passages.` },
    ]
    for (let i = 0; i < num; i++) {
        let d = docs[i]
        messages.push({ role: "user", content: `[${i + 1}]. ${d.name} ${d.content} ${d.url}` })
        messages.push({ role: "assistant", content: `Received passage [${i + 1}].` })
    }
    let example_ordering = "[2] > [1]"
    messages.push({ role: "user", content: `Search Query: ${query}.\nRank the ${num} passages above based on their relevance to the search query. All the passages should be included and listed using identifiers, in descending order of relevance. The output format should be [] > [], e.g., ${example_ordering}, Only respond with the ranking results, do not say any word or explain.` })

    let r = sendOpenAIMessage(model, messages)
        .then(r => {
            if (!r.includes('>')) {
                return Promise.reject(`Instead of ranking we got this ${r}.`)
            }   
            return r.split(' > ').map(s => s.trim().replace('[', '').replace(']', '')).map(s => parseInt(s)).filter(s => !isNaN(s)).reverse()
        })
        .then(ranks => {
            // check that the list if complete
            if (ranks.length != num) {
                return Promise.reject(`The number of provided passages does not match the number of expected passages. ${ranks.length}!=${num}`)
            }            



            let rankedDocs = []
            for (let ri in ranks) {
                ri = parseInt(ri)
                let doc = docs[ranks[ri] - 1]
                rankedDocs.push({...doc, rank: ri})
            }
            return rankedDocs
        })
    return r
}

async function scrape_whole_docs(docs) {
    // could also use webarchives if needed
    const htmlarkdown = new HTMLarkdown()
    let promises = docs.map(async (doc) => {
        const url = 'https://corsproxy.io/?' + encodeURIComponent(doc.url);
        // const url = 'https://archive.today/?run=1&url=' + encodeURIComponent(doc.url)
        // https://webcache.googleusercontent.com/search?q=cache:https%3A%2F%2Fmedium.com%2F%40cybersphere%2Ffetch-api-the-ultimate-guide-to-cors-and-no-cors-cbcef88d371e
        // https://archive.today/?run=1&url=https%3A%2F%2Fmedium.com%2F%40cybersphere%2Ffetch-api-the-ultimate-guide-to-cors-and-no-cors-cbcef88d371e
        // https://archive.today/?run=1&url=https%3A%2F%2Fmedium.com%2F%40cybersphere%2Ffetch-api-the-ultimate-guide-to-cors-and-no-cors-cbcef88d371e
        let md

        // a = fetch(url, { mode: 'no-cors', redirect: 'follow', referrer: '', window: window, headers: { Referer: url } }); a
        
        try {
            let response = await fetch(
                url, { mode: 'no-cors', redirect: 'follow', referrer: '', window: window }
            )
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let body = await response.text()

            md = htmlarkdown.convert(body)
        } catch (e) {
            console.log(e)
            md = null
        }
        return {
            url: url,
            content: md,
            source: doc.source + '[web]',
            name: doc.name,
            query: doc.query
        }
    })
    return await Promise.all(promises)
}



function answer_with_docs(query, rankedDocs, model = defaultModel) {
    let history_summary = ''
    let messages = [
        { role: "system", content: `You are a helpful assistant knowledgeable about AI Alignment and Safety. Please give a clear and coherent answer to the user\'s questions. (written after "Q:") using the following sources. Each source is labeled with a letter. Feel free to use the sources in any order, and try to use multiple sources in your answers` },
        { role: "user", content: `Please give a clear and coherent answer to my question. (written after "Q:") using the following sources. Each source is ranked labeled with a letter. Feel free to use the sources in any order, and try to use multiple sources in your answers. Q: "${query}". The sources are:` },
        { role: "assistant", content: `Okay, I an ready to carefully consider the first document and how I can use it to answer your query.` },
    ]
    for (let i in rankedDocs) {
        i = parseInt(i)
        let d = rankedDocs[i]
        messages.push({ role: "user", content: `[${i}]Title:  ${d.name}:\n\nContent: ${d.content}\n\nUrl:${d.url}` })
        messages.push({ role: "assistant", content: `I have considered passage [${parseInt(i) + 1}]. Next please.` })
    }

    messages.push({ role: "user", content: `Think step by step and use the provided documents to create the most informed, well reasoned answers possible. Use markdown lists where possible. In your three alternative answers, take differen't approaches that lead to differen't content and citations if reasonably possible using the format: [a], [b], etc. If you use multiple sources to make a claim cite all of them. For example: \"AGI is concerning [c, d, e].\"\n\nQ: ${history_summary}: ${query}\n` })

    let answer = sendOpenAIMessage(model, messages)
    return answer
}





function search(q, model = defaultModel, setReply, setStatus, setDocs) {
    // Step 1: search
    setStatus({ status: "Searching" })
    let r1p = bingWebSearch(q)

    // Step 2: rephrase and search
    let q2p = rephrase(q, model)
    let r2p = q2p.then((q2) => bingWebSearch(q2))

    // Step 3: example_answer
    let r3p = exampleAnswer(q, model).then((q3) => bingWebSearch(q3))

    // Step 3: rank
    // wait for all promises to resolve before continuing
    let rankedDocsP = Promise.all([r1p, r2p, r3p]).then(([r1, r2, r3]) => {
        setStatus({ status: "Ranking" })
        return rank(q, r1, r2, r3, model)
    })

    let answer = rankedDocsP.then((rankedDocs) => {
        setDocs(rankedDocs)
        setStatus({ status: "Scraping" })
        // Step 4: scrape whole docs, for top 10
        let top10 = rankedDocs.slice(0, 10)
        return scrape_whole_docs(top10).then(fullDocs => { 
            fullDocs = fullDocs.filter(d => d.content != null)
            return [...fullDocs, ...rankedDocs.slice(0, 50)]

        })

    }).then((rankedDocs) => {
        setStatus({ status: "Answering" })
        return answer_with_docs(q, rankedDocs, model)
    }).catch((err) => {
        console.log(err);
        err = escapeHtml(err)
        setStatus({ error: `<Alert variant="warning">Error: ${err}
  </Alert>` })
        return err;
    }).then((answer) => {
        setReply(answer)
        setStatus({})
        return answer;
    })
    return answer
}

export default search
