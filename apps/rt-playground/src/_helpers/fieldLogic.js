import axios from './axios';
import { endpoints } from '../_services/endpoints';
import * as Formsy from 'formsy-react';
import { user } from '../_reducers';

Formsy.addValidationRule('required', (values, value) => {
  // return evalString(values, value?.condition);
  return value != '' && value != null && value != undefined;
});

function getFieldLogicObject(field) {
  try {
    let fieldLogic = null;
    if (field?.customAttributes && field.customAttributes?.fieldLogic) {
      fieldLogic = JSON.parse(field.customAttributes.fieldLogic);
    }
    return fieldLogic;
  } catch (error) {
    console.log('Error parsing fieldLogic', error);
  }
}

export function evalString(model, fieldLogicString) {
  try {
    return eval(fieldLogicString);
  } catch (e) {
    // throw new Error(`string is not evalable ${fieldLogicString} for ${inspect(model)}`);
  }
}

function fieldGetter(fields, fieldID, logic) {
  const field = fields[fieldID];
  const propEval = evalString(fields, logic);
  return [field, propEval];
}
export function resolveHidden(fields, fieldID, logic) {
  const [field, propEval] = fieldGetter(fields, fieldID, logic);
  if (propEval) {
    field.value = null;
  }
  field.hide = propEval || false;
}
export function resolveDisabled(fields, fieldID, logic) {
  const [field, propEval] = fieldGetter(fields, fieldID, logic);
  field.disabled = propEval || false;
}
export function resolveQuery(fields, fieldId) {}
export function resolveValidations(fields, fieldId) {}
function setFieldByCustomAttributes(fields, field, logic, prop) {
  const fieldID = field.fieldID;

   const resetErrors = (k, v) => {
     field.fieldValidations.errors =
       field.fieldValidations?.errors?.filter(
         (e) => e.message !== v?.message
       ) || [];
    //  delete field.fieldValidations?.validations[k];
     delete field.fieldValidations?.validationErrors[k];
   };

  switch (prop) {
    case 'hide':
      resolveHidden(fields, fieldID, logic);
      break;
    case 'disabled':
      resolveDisabled(fields, fieldID, logic);
      break;
    case 'validations':
       Object.entries(logic).forEach(([key, value]) => {
         switch (key) {
           case 'required':
             if (field.value.length === 0) {
               field.fieldValidations.errors.uniquePush('message', {
                 message: value.message,
               });
               field.fieldValidations.validations = {
                 ...field.fieldValidations.validations,
                 required: false,
               };
               field.fieldValidations.validationErrors = {
                 ...field.fieldValidations.validationErrors,
                 required: value.message,
               };
             } else resetErrors(key, value);
             break;
           case 'minLength':
             if (field.value.length < +value.condition) {
               field.fieldValidations.errors.uniquePush('message', {
                 message: value.message,
               });
               field.fieldValidations.validations = {
                 ...field.fieldValidations.validations,
                 minLength: value.condition,
               };
               field.fieldValidations.validationErrors = {
                 ...field.fieldValidations.validationErrors,
                 minLength: value.message,
               };
             } else resetErrors(key, value);
             break;
           case 'maxLength':
             if (field.value.length > +value.condition) {
               field.fieldValidations.errors.uniquePush('message', {
                 message: value.message,
               });
               field.fieldValidations.validations = {
                 ...field.fieldValidations.validations,
                 maxLength: value.condition,
               };
               field.fieldValidations.validationErrors = {
                 ...field.fieldValidations.validationErrors,
                 maxLength: value.message,
               };
             } else resetErrors(key, value);
             break;
           case 'pattern':
             // if (!new RegExp(value.condition).test(field.value)) {
             //   field.fieldValidations.errors.uniquePush('message', { message: value });
             // } else {
             //   undoValidation();
             // }
             break;
           case 'equalsField':
             const condition =
               value?.condition && evalString(fields, value?.condition);
             
             if (fields[condition]['value'] != field.value) {
               field.fieldValidations.errors.uniquePush('message', {
                 message: value?.message,
               });
               field.fieldValidations.validations = {
                 ...field.fieldValidations.validations,
                 [key]: condition,
               };
               field.fieldValidations.validationErrors = {
                 ...field.fieldValidations.validationErrors,
                 [key]: value?.message,
               };
             } else resetErrors(key, value);
             break;
           default:
             break;
         }
       }); 
      
      break;
    case 'asyncValidations':
      
      break;
    default:
      break;
  }

  // const propEval = evalString(fields, logic);
  // if (propEval) {
  //   if (prop === "hide") {
  //     field.value = null;
  //   }
  // }
  // field[prop] = propEval;
}
export function fieldResolver(fields, field) {
  // set field attributes for hide and disabled
  field.hide = false;
  field.disabled = false;

  const customAttributes = field.customAttributes;
  let fieldLogic = null;

  
  if (customAttributes && customAttributes.fieldLogic) {
    fieldLogic = JSON.parse(customAttributes.fieldLogic);
  }

  if (fieldLogic) {
    Object.entries(fieldLogic).map(([key, value]) => {
      setFieldByCustomAttributes.apply(this, [fields, field, value, key]);
    });
  }
}
export function onBlurTextInputCheckValidations(fields, field) {
  
  return (e, data) => {
    const logic = getFieldLogicObject(field);
    const toggleClass = (add = false) => {
      let element = document.querySelector(
        `[reference="${field.fieldID}"]`
      );
      if (!element) return;

      element.classList.remove('error');
      element.parentElement.classList.remove('error');

      if (add) {
        element.classList.add('error');
        element.parentElement.classList.add('error');
      }
    };
    const resetErrors = (k, v) => {
      field.fieldValidations.errors =
        field.fieldValidations?.errors?.filter(
          (e) => e.message !== v?.message
        ) || [];
      delete field.fieldValidations?.validations[k];
      delete field.fieldValidations?.validationErrors[k];
      this.setState({ ...this.state }, () => null);
      toggleClass();
    };

   

    if(logic && logic.asyncValidations) {
      Object.entries(logic?.asyncValidations).forEach(([key, value]) => {
         if (field.value.length < 5 || field.value.length > 12) { resetErrors(key, value); return; }
         switch (key) {
           case 'usernameAvailable':
             
               // Call ASYNC to check if username is available
               // if not, set error
               let url =
                 endpoints.API__V1_URL +
                 endpoints.DATA +
                 '/' +
                 evalString(fields, value?.data);
              //  console.log(url);
              const validate = (res) => {
                if (evalString(res.data, value?.condition)) {
                  Formsy.addValidationRule(key, (values, value) => {
                    return false;
                  });
                  field.fieldValidations.errors.uniquePush('message', {
                    message: value.message,
                  });
                  field.fieldValidations.validations = {
                    ...field.fieldValidations.validations,
                    usernameAvailable: true,
                  };
                  field.fieldValidations.validationErrors = {
                    ...field.fieldValidations.validationErrors,
                    usernameAvailable: value.message,
                  };
                  this._fields[field.fieldID] = field;
                  this.setState({ ...this.state }, () => null);
                } else {
                  resetErrors(key, value);
                }
              }
              const $f = 'Username';
               axios
                 .get(url, {params: { $c: 1,  }})
                 .then((res) => {
                   validate(res);
                 })
                 .catch((err) => {
                   console.log(err);
                   validate({ pxResults: [] });
                 });
           default:
             break;
         }
       });
    }
  }
}
export function dropDownOnFocus(field) {
  return (e, data) => {
    let _options = [];
    let control = field.control;
    let fieldLogic = getFieldLogicObject(field);
    let mode = control.modes && control.modes.length && control.modes[0];
    let parentOf = fieldLogic?.data?.pof;
    let state = this.state;

    if (parentOf && parentOf?.length > 0) {
      const obj = parentOf.reduce((p, c) => {
        return {
          ...p,
          [c]: null,
        };
      }, {});
      state = {
        ...this.state,
        values: {
          ...this.state.values,
          ...obj,
        },
        controls: {
          ...obj,
        },
      };
      this.setState({
        ...state,
      });
    }

    if (mode?.options && mode.options?.length > 0) return;

    if (!!fieldLogic?.data && fieldLogic?.data.page) {
      this.setState({
        controls: { ...state.controls, [field.fieldID]: [] },
        loadingElems: { ...state.loadingElems, [field.fieldID]: true },
      });

      let query = evalString(this._fields, fieldLogic.data.query);
      let url =
        endpoints.API__V1_URL + endpoints.DATA + '/' + fieldLogic?.data?.page;
      if (query && query.charAt(query.length - 1) != '=') {
        url = `${url}?${query}`;
      }
      if (fieldLogic.data.page) {
        axios
          .get(url, {
            params: { $c: 1, $f: fieldLogic?.data?.fields?.join(',') },
          })
          .then((res) => {
            if (res) {
              _options = state.controls[field.fieldID];
              const _oldOptions = _options;
              const prop = fieldLogic.data.prop;
              _options = res.data.pxResults.map((v) => ({
                key: v[prop],
                text: v[prop],
                value: v[prop],
              }));
              this.setState({
                controls: {
                  ...state.controls,
                  [field.fieldID]: _options,
                },
                loadingElems: {
                  ...state.loadingElems,
                  [field.fieldID]: false,
                },
              });
              
            }
          });
      }
    }
  };
}


Array.prototype.uniquePush = function (prop, item) {
  if(prop) {
    if (!this.some((e) => e[prop] === item[prop])) {
      this.push(item);
    }
    return this;
  }

  if (!this.includes(item)) {
    this.push(item);
  }
  return this;
}

Array.prototype.popByPropAll = function (prop, value) {
  return this.filter((e) => e[prop] !== value);
}