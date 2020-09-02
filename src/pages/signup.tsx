import React from 'react';
import { styled } from '@material-ui/core/styles';
import Api from '../utils/api';

const Main = styled('main')({
  height: '100%',
  position: 'relative',
  color: '#000',
  textAlign: 'center',
});

const FieldHeader = styled('h1')({});
const FieldInput = styled('input')({
  fontSize: '24px',
});

interface Data {
  key: string;
  value: any;
}

// https://medium.com/@colebemis/building-a-checkbox-component-with-react-and-styled-components-8d3aa1d826dd
// TODO: Maybe move out to reusable component
const Checkbox = (props: any) => <input type="checkbox" {...props} />;

const LabeledCheckbox = (props: any) => (
  <label>
    <Checkbox id={props.id} defaultChecked={props.checked} onChange={props.onCheckboxChange} />
    <span>{props.text}</span>
  </label>
);

export default function Signup(props: any) {
  const checkboxesState = {
    accept_tos: false,
    receive_marketing: false,
  };

  const onCheckboxChange = (event: any) => {
    console.log(event.target.id);
    const checkbox = event.target;
    const id = event.target.id;
  };

  const register = async (input) => {
    const result: any = await Api.signup(input);
    const temp: any = document.getElementById('temp') || {};

    if (result && result.success) {
      const signupUrl = (result || {}).signupUrl;
      temp['innerHTML'] = `<div>Check your email to complete signup! </a>`;
    } else {
      alert(result.message);
    }
  };

  const finishSignup = async () => {
    const input = getInput();
    const validation = checkInput(input);
    if (validation.valid) {
      if (props.register) {
        // Support embedding the signup form with custom behavior
        // e.g. for processing email invitations.
        await props.register(input);
      } else {
        await register(input);
      }
    } else {
      alert(`Invalid fields: ${JSON.stringify(Object.keys(validation.invalidFields))}`);
      console.log(validation);
    }
  };

  const getInputValue = (fieldId: string) => {
    const input = document.getElementById(fieldId) as HTMLInputElement;
    return input.value;
  };

  const getCheckedValue = (checkboxId: string) => {
    const checked = document.getElementById(checkboxId) as HTMLInputElement;
    return checked.checked;
  };

  const getInput = () => {
    return {
      firstName: getInputValue('first_name'),
      lastName: getInputValue('last_name'),
      email: getInputValue('email'),
      acceptTos: getCheckedValue('accept_tos'),
      receiveMarketing: getCheckedValue('receive_marketing'),
    };
  };

  const checkInput = (input: { [key: string]: any }) => {
    // In principle all string input is vulnerable to XSS
    // E.g. the name could be <script>sendLocalStorageContentsToMyServer()</script>
    // TODO: input validation should prevent XSS, e.g. disallow < and >
    const invalidFields: any = {};
    // TODO: we can hook up some npm package for field validation
    if (!input['firstName']) invalidFields['first_name'] = true;
    if (!input['lastName']) invalidFields['last_name'] = true;
    // We don't need to validate email too much, since we'll verify it via otp
    if (!input['email']) invalidFields['email'] = true;
    if (!input['acceptTos']) invalidFields['accept_tos'] = true;

    if (Object.keys(invalidFields).length > 0) {
      return {
        valid: false,
        invalidFields: invalidFields,
      };
    } else {
      return { valid: true };
    }
  };

  return (
    <Main>
      <FieldHeader>First name</FieldHeader>
      <FieldInput id="first_name"></FieldInput>
      <FieldHeader>Last name</FieldHeader>
      <FieldInput id="last_name"></FieldInput>
      <FieldHeader>Email</FieldHeader>
      <FieldInput id="email"></FieldInput>
      <div>
        <LabeledCheckbox
          id="accept_tos"
          checked={checkboxesState['accept_tos']}
          onCheckboxChange={onCheckboxChange}
          text="Accept TOS"
        />
      </div>
      <div>
        <LabeledCheckbox
          id="receive_marketing"
          checked={checkboxesState['receive_marketing']}
          onCheckboxChange={onCheckboxChange}
          text="Marketing"
        />
      </div>
      <button onClick={finishSignup}> Sign up </button>
      <div id="temp"></div>
    </Main>
  );
}
