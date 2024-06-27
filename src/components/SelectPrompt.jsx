import React, { useState, useEffect } from 'react';
import Editor from './Editor'
import defaultPrompts from '../helpers/defaultPrompts'
import Select from 'react-select'
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

/** This component allows the user to select a previous prompt from a dropdown list. */
const SelectPrompt = ({ onChange }) => {
    const [prompts, setPrompts] = useState(defaultPrompts);
    const [currentPrompt, setCurrentPrompt] = useState(defaultPrompts[0]);
    const [selectedIndex, setSelectedIndex] = useState(null);

    useEffect(() => {
        const savedPrompts = localStorage.getItem('prompts');
        if (savedPrompts) {
            setPrompts(JSON.parse(savedPrompts));
        }
    }, []);

    const savePrompt = () => {
        let newPrompts;
        if (selectedIndex !== null) {
            newPrompts = [...prompts];
            newPrompts[selectedIndex] = currentPrompt;
        } else {
            newPrompts = [...prompts, currentPrompt];
        }
        setPrompts(newPrompts);
        localStorage.setItem('prompts', JSON.stringify(newPrompts));
    };

    const handleSelectChange = (event) => {
        setCurrentPrompt(event.label);
        onChange(event.label);
        setSelectedIndex(prompts.indexOf(event.label));
    };

    const handleEditorChange = (event) => {
        setCurrentPrompt(event.label);
        onChange(event.label);
    };

    const deletePrompt = () => {
        const newPrompts = prompts.filter((_, index) => index !== selectedIndex);
        setPrompts(newPrompts);
        localStorage.setItem('prompts', JSON.stringify(newPrompts));
        setCurrentPrompt('');
        onChange('');
        setSelectedIndex(null);
    };

    const options = prompts.map((prompt) => ({ value: prompt, label: prompt }));
    const value = prompts.indexOf(currentPrompt);

    return (
        <div>
            <Form>
                <Form.Group>
                    <Form.Label htmlFor="countries">Select a previous prompt</Form.Label>
                    <Select
                        options={options}
                        onChange={handleSelectChange}
                        value={value}
                    />
                </Form.Group>
                {/* <Label htmlFor="countries" >Select a previous prompt</Label>
                    <Select
                        
                        value={currentPrompt}
                    onChange={handleSelectChange}
                    >
                        {prompts.map((prompt, index) => (
                            <option key={index} value={prompt}>
                                {prompt}
                            </option>
                        ))}
                    </Select> */}
                <Form.Group>
                    <Editor name="Edit prompt" value={currentPrompt} onChange={handleEditorChange} rows="12" />
                    <Button
                        variant="secondary"
                        onClick={savePrompt}>Save</Button>
                    <Button
                        variant="secondary"
                        onClick={deletePrompt}
                    >Delete</Button>
                </Form.Group>
            </Form>
        </div>
    );
};

export default SelectPrompt;
