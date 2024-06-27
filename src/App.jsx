import { useState } from 'react'
import './App.css'

import SelectPrompt from './components/SelectPrompt';
import Editor from './components/Editor'
// import Diff from './components/Diff2';
// import Select from 'react-select'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import CreatableSelect from 'react-select/creatable';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
// import Select from 'react-select/dist/declarations/src/Select';
import defaultPrompts from './helpers/defaultPrompts'
import InputLocalStorageCached from './components/InputLocalStorageCached';
import sendOpenAIMessage from './helpers/openaiMessage';
import search from './helpers/rag';
import Citations from './components/Citations';

const model_options = [
  // https://platform.openai.com/docs/models/continuous-model-upgrades
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo',
  // 'text-moderation-stable',
  'gpt-4o', 
].map((model) => ({ value: model, label: model }))


function Progress({ data }) {
  if (!data) {
    return null;
  }
  const { status, error, loading } = data

  if (status) {
    return <Alert variant="info">{status}</Alert>
  }
  if (!error || error === null) {
    return null;
  }
  return <Alert variant="warning">Error: {error}
  </Alert>
}


const defaultDocs = [
  {
    "name": "Fluids and flows in brain cancer and neurological disorders",
    "url": "https://wires.onlinelibrary.wiley.com/doi/full/10.1002/wsbm.1582",
    "content": "1 INTRODUCTION 1.1 Brain fluid compartments. The brain interstitial space is a dynamic location between the parenchymal cells and vasculature, which provides the fluid and structural environment to support cellular functions.",
    "query": "(\"Computational neuroscience methods\" OR \"neural computation techniques\" OR \"neuroinformatics tools\" OR \"simulation methods in neuroscience\") AND (\"MechInterp\" OR \"Mechanical Interpretation\" OR \"Mechanical interpretation tools\" OR \"Mechanical interpretation strategies\")",
    "source": "bing",
    "rank": "01"
  },
  {
    "name": "Frontiers | Individual Differences in Math Ability Determine ...",
    "url": "https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2019.00227/full",
    "content": "In the analysis of ER, significant main effects were observed for complexity (F 1,29 = 241.31, p < 0.001, η p 2 = 0.893), math ability (F 1,29 = 14.06, p = 0.001, η p 2 = 0.327) and operation (F 1,29 = 7.01, p = 0.013, η p 2 = 0.195), indicating higher ER for complex compared to simple arithmetic problems, for individuals with low compared to high math ability, and for division compared to ...",
    "query": "(\"Computational neuroscience methods\" OR \"neural computation techniques\" OR \"neuroinformatics tools\" OR \"simulation methods in neuroscience\") AND (\"MechInterp\" OR \"Mechanical Interpretation\" OR \"Mechanical interpretation tools\" OR \"Mechanical interpretation strategies\")",
    "source": "bing",
    "rank": "11"
  },
  {
    "name": "Machine learning and artificial intelligence in neuroscience: A primer ...",
    "url": "https://www.sciencedirect.com/science/article/pii/S0889159123003380",
    "content": "Neuro-gastroenterology is a field with challenges that make it particularly suited to attempt machine learning approaches: for better understanding of the underlying mechanisms, using microbiomic and metabolomic datasets results in high-dimensional data, which needs to be integrated with multiple levels of patient-reported outcomes or imaging ...",
    "query": "MechInterp, a mechanical interpretation model, can leverage various computational neuroscience techniques for enhanced problem-solving. This includes methods like neural simulations to experiment with different mechanical interpretations, computational modeling to represent complex mechanical systems, and data analysis algorithms to glean insights from large neuroscience datasets. Additionally, techniques such as machine learning algorithms can be applied to interpret and predict mechanical patterns based on neuroscientific data. Network theory may also assist in understanding the complexity and connectivity within mechanical systems by adopting principles from neuroscience.\n",
    "source": "bing",
    "rank": "21"
  },
  {
    "name": "Neurocomputing | Frontiers in Graph Computation: Techniques, Challenges ...",
    "url": "https://www.sciencedirect.com/special-issue/102H7QVSWQG",
    "content": "In the realm of data representation, graphs stand out as one of the most ubiquitous and versatile structures. The onset of the digital age, characterized by the surge of online platforms, IoT devices, and interconnected systems, has led to a monumental increase in the generation and availability of graph data. This vastness of data, often termed as 'Big Data', coupled with its ...",
    "query": "(\"Computational neuroscience methods\" OR \"neural computation techniques\" OR \"neuroinformatics tools\" OR \"simulation methods in neuroscience\") AND (\"MechInterp\" OR \"Mechanical Interpretation\" OR \"Mechanical interpretation tools\" OR \"Mechanical interpretation strategies\")",
    "source": "bing",
    "rank": "31"
  },
  {
    "name": "Development of Novel Neurotechnologies and Computational Models for ...",
    "url": "https://acm-stag.literatumonline.com/doi/10.5555/AAI28862915",
    "content": "Author: Xin Liu. University of California, San Diego, Advisor: Kuzum, Duygu. University of California, San Diego, Committee Members: Cauwenberghs, Gert",
    "query": "(\"Computational neuroscience methods\" OR \"neural computation techniques\" OR \"neuroinformatics tools\" OR \"simulation methods in neuroscience\") AND (\"MechInterp\" OR \"Mechanical Interpretation\" OR \"Mechanical interpretation tools\" OR \"Mechanical interpretation strategies\")",
    "source": "bing",
    "rank": "41"
  },
  {
    "name": "Holdings: Computational neuroscience and cognitive modelling ...",
    "url": "https://librarysearch.aut.ac.nz/vufind/Record/1497141/TOC?sid=28864735",
    "content": "Computational neuroscience and cognitive modelling : a student's introduction to methods and procedures / Britt Anderson.",
    "query": "(\"Computational neuroscience methods\" OR \"neural computation techniques\" OR \"neuroinformatics tools\" OR \"simulation methods in neuroscience\") AND (\"MechInterp\" OR \"Mechanical Interpretation\" OR \"Mechanical interpretation tools\" OR \"Mechanical interpretation strategies\")",
    "source": "bing",
    "rank": "51"
  },
  {
    "name": "Computational Neuroscience - PMC - National Center for Biotechnology ...",
    "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3966414/",
    "content": "This special issue of Computational Neuroscience (CN) includes 15 original articles, which have been selected from the highest quality submissions.",
    "query": "(\"Computational neuroscience methods\" OR \"neural computation techniques\" OR \"neuroinformatics tools\" OR \"simulation methods in neuroscience\") AND (\"MechInterp\" OR \"Mechanical Interpretation\" OR \"Mechanical interpretation tools\" OR \"Mechanical interpretation strategies\")",
    "source": "bing",
    "rank": "61"
  },
]


function App() {
  const [count, setCount] = useState(0)
  const [input, setInput] = useState(`What kinds of computational neuroscience techniques could be used in MechInterp?.`)
  const [prompt, setPrompt] = useState(defaultPrompts[0])
  const [reply, setReply] = useState(`"**Post-Hoc Interpretability Techniques**: [1, 2, 3] These techniques are applied after the model has been trained to gain insights into its behavior and decision-making processes. They include efforts to uncover general,[2, 4] transferable principles across models and tasks, as well as automating the discovery and interpretation of critical circuits in trained models [4].".`)
  const [status, setStatus] = useState(null)
  const [docs, setDocs] = useState(defaultDocs)
  const [openaiModel, setOpenAIModel] = useState('gpt-4')



  return (
    <Container>
      <Row>
        <Col sm={4}>
          <Row>

            <Form>
              <FloatingLabel label="OPENAI_KEY:"
              >
                <InputLocalStorageCached storageKey="OPENAI_KEY" as={Form.Control} type="password" required />
              </FloatingLabel>
            </Form>
          </Row><Row>
            <Form>
              <FloatingLabel label="BASE_URL:"
              >
                <InputLocalStorageCached storageKey="OPENAI_BASE_URL" default="https://api.openai.com/v1" as={Form.Control} type="text" />
              </FloatingLabel>
            </Form>

          </Row><Row>

            <Form>
              <Form.Label>OPENAI_MODEL:</Form.Label>
              <CreatableSelect
                options={model_options}
                creatable={true}
                defaultValue={model_options[0]}
                onChange={(s) => setOpenAIModel(s.label)}
                required
              />

            </Form>
          </Row><Row>
            <Form>
              <FloatingLabel label="Temperature:">
              <InputLocalStorageCached storageKey="OPENAI_TEMP" as={Form.Control} type="number" step="0.1" defaultValue="1"
                  min="0"
                  max="2" />
              </FloatingLabel>
            </Form>


          </Row><Row>
            <Form>
              <FloatingLabel label="BING_SEARCH_KEY:" title="https://www.microsoft.com/en-us/bing/apis/bing-web-search-api">
              <InputLocalStorageCached storageKey="BING_SEARCH_KEY" as={Form.Control} type="password" required />
              </FloatingLabel>
            </Form>
          </Row>


        </Col>
        <Col sm={8}>
          <Row>
            <Form onSubmit={e => e.preventDefault()}>
              <Editor name="Search" value={input} onChange={(e) => setInput(e.target.value)} rows="3" />
              <Button
                variant="primary"
                onClick={() => setCount(() => search(input, openaiModel, setReply, setStatus, setDocs))}>
                Submit
              </Button>
              <Progress data={status} />
            </Form>
          </Row>
          <Row>
            <Form>
              <Citations name="Answer" value={reply} docs={docs}/>
            </Form>
          </Row>
        </Col>
      </Row>
    </Container>
  )
}

export default App
