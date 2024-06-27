import React, { useState, useEffect, useImperativeHandle } from 'react';

/** This is an input box that saves the input value to localStorage */
const InputLocalStorageCached = ({ storageKey: storageKey, defaultValue, as: Wrapper, ...props}) => {
  const [value, setValue] = useState(() => {
    let v = window.localStorage.getItem(storageKey) || defaultValue
    // v = JSON.parse(v)
    return v;
  });

  useEffect(() => {
    const storedValue = window.localStorage.getItem(storageKey);
    if (storedValue !== null) {
      setValue(storedValue);
    }
  }, [storageKey]);

  const handleChange = (event) => {
    setValue(event.target.value);
    let v = event.target.value
    // v = JSON.stringify(event.target.value)
    window.localStorage.setItem(storageKey, v);
  };

  useImperativeHandle(props.ref, () => ({
    value,
    onChange: handleChange,
  }));

  return (
    <Wrapper {...props} value={value} onChange={handleChange} />
  );
};

export default InputLocalStorageCached;
