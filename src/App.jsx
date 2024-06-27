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



function App() {
  const [count, setCount] = useState(0)
  const [input, setInput] = useState(`What kinds of computational neuroscience techniques could be used in MechInterp?.`)
  const [prompt, setPrompt] = useState(defaultPrompts[0])
  const [reply, setReply] = useState(`"**Post-Hoc Interpretability Techniques**: [1, 2, 3] These techniques are applied after the model has been trained to gain insights into its behavior and decision-making processes. They include efforts to uncover general,[2, 4] transferable principles across models and tasks, as well as automating the discovery and interpretation of critical circuits in trained models [4].".`)
  const [status, setStatus] = useState(null)
  const [docs, setDocs] = useState([
    { name: 'name', url: 'localhost', content: 'c1', rank: 2, q: '1', source: 'bing' },
    { name: 'name', url: 'localhost', content: 'c2', rank: 5 },
    { name: 'name', url: 'localhost', content: 'c3', rank: 10 },
    { name: 'name', url: 'localhost', content: 'c4', rank: 7 },
  ])
  const [openaiModel, setOpenAIModel] = useState('gpt-4')



  return (
    <Container>
      <Row>
        <Col sm={4}>
          <Row>

            <SelectPrompt value={prompt} onChange={setPrompt} />
          </Row><Row>


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
              <Editor name="Search" value={input} onChange={(e) => setInput(e.target.value)} />
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
