import axios from './axios';
import { endpoints } from '../_services/endpoints';

function getFieldLogicObject(field) {
  try {
    let fieldLogic = null;
    if (field.customAttributes && field.customAttributes.fieldLogic) {
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

  switch (prop) {
    case 'hide':
      resolveHidden(fields, fieldID, logic);
      break;
    case 'disabled':
      resolveDisabled(fields, fieldID, logic);
      break;
    case 'data':
      // const dataEndpoint = evalString(fields, logic);
      // const splitted = dataEndpint.split('=');
      //
      // const response = await axios.get(dataEndpoint);

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

  // TODO
  // will remove this when logic is implemented on backend
  // if (field.fieldID === "City") {
  //   field.customAttributes = {};
  //   if (field.customAttributes) {
  //     field.customAttributes.fieldLogic = JSON.stringify({
  //       // hide: "model.IWantToReport.value=='Business'",
  //       hide: "model.visitedCoutries.value.includes('Pakistan')",
  //       disabled: "model.IWantToReport.value=='Business'",
  //       data: "D_ListStates?Country=${model.Country.value}",
  //       validation: {
  //         required: {
  //           message: "Please select a state",
  //           condition: "model.Country.value=='Pakistan'",
  //         },
  //         pattern: {
  //           message: "Please select a valid email address",
  //           condition: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/,
  //         },
  //       },
  //       asyncValidations: {
  //         usernameAvailable: {
  //           message: "Username is not available",
  //           condition: false,
  //           data: "D_CheckUsername?Username=model.Username.value",
  //         },
  //       },
  //     });
  //   }
  // }

  if (customAttributes && customAttributes.fieldLogic) {
    fieldLogic = JSON.parse(customAttributes.fieldLogic);
  }

  if (fieldLogic) {
    Object.entries(fieldLogic).map(([key, value]) => {
      setFieldByCustomAttributes(fields, field, value, key);
    });
    // // check hidden attribute
    // if (fieldLogic.hide) {
    //   setFieldByCustomAttributes(fields, field, fieldLogic.hide, "hide");
    // }
    // // check disabled attribute
    // if (fieldLogic.disabled) {
    //   setFieldByCustomAttributes(fields, field, fieldLogic.disabled, "disabled");
    // }
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
        axios.interceptors.request.use((request) => {
          // Add authorization header if set
          const authHdr = sessionStorage.getItem('pega_react_user');
          if (authHdr) {
            request.headers.Authorization = authHdr;
          } else {
            if (endpoints.use_OAuth) {
              // Tried to implement popping up login dialog, but with scenarios where async requests might fire
              //  was much easier to leverage the reAuth logic to coordinate this
              // Should always have an authHdr (and we keep around expired ones to trigger the reauth logic)
              //  If we do fall in here, just cancel, as you are guaranteed to get a 400 failure on server without
              //  the Auhtorization header
              throw new axios.Cancel('Invalid access token');
            }
          }
          return request;
        });

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
              if (!_.isEqual(_oldOptions, _options)) {
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
            }
          });
      }
    }
  };
}
