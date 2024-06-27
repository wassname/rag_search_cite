import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Alert from 'react-bootstrap/Alert';

export default function Editor({ name, value, onChange, rows }) {
    return <Form.Group>
      {/* <FloatingLabel htmlFor={name} label={name}>
        <Form.Control as="textarea" 
          id={name}
          rows={rows || 8}
          type="text"
          value={value}
          placeholder={name}
          onChange={onChange}
          required
        /></FloatingLabel> */}
      
      <Form.Label htmlFor={name} label={name}><h4>{name}</h4></Form.Label>
        <Form.Control as="textarea" 
          id={name} rows={rows || 8}
          type="text"
          value={value}
          placeholder={name}
          onChange={onChange}
          required
        />
    </Form.Group>
  }
