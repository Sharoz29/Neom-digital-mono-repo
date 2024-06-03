import _ from "lodash";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Form } from "formsy-semantic-ui-react";

import { dataPageService } from "../_services";
import { buildDPParams, buildDPQueryString } from "../_helpers";

/**
 * Standardized component to handle dropdowns sourced from data pages.
 */
class DataPageDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataPageQuery: "", //String representation of last DP query with params
      options: []
    };
  }

  fetchDP( mode ) {
    let params = buildDPParams(mode.dataPageParams);
    let dataPageQuery = buildDPQueryString(mode.dataPageID, params);

    // Directly calling dataPageService methods so we do not have actions overhead.
    // This should be very narrow use case, specific to component.
    dataPageService
      .getDataPage(mode.dataPageID, params)
      .then(
        dataPage => {
          this.setState({
            dataPageQuery: dataPageQuery,
            options: this.convertDataPageToOptions(dataPage)
          });
        },
        error => {
          this.setState({
            dataPageQuery: dataPageQuery,
            options: [{ key: error, text: error, value: error }]
          });
        }
      );
  }

  convertDataPageToOptions(dataPage) {
    let { mode } = this.props;
    let options = [];

    // Value it the first advanced search entered entry (main result)
    let propName = mode.dataPageValue, propPrompt = mode.dataPagePrompt, propTooltip = mode.dataPageTooltip;

    if (propName.indexOf(".") === 0) {
      propName = propName.substring(1);
    }

    dataPage.pxResults.forEach(result => {
      if (result[propName]) {
        let option = {
          key: result["pzInsKey"] ? result["pzInsKey"] : result[propName],
          text: result[propPrompt],
          value: result[propName],
        };
        if( propTooltip != "" ) {
          option.tooltip = result[propTooltip];
        }
        options.push(option);
      }
    });

    return options;
  }

  getOptions() {
    if (this.state.options.length > 0) {
      return this.state.options;
    } else {
      return [];
    }
  }

  componentDidMount() {
    const { mode } = this.props;
    this.fetchDP(mode);
  }

  componentDidUpdate() {
    const { mode } = this.props;
    let params = buildDPParams(mode.dataPageParams);
    let dataPageQuery = buildDPQueryString(mode.dataPageID, params);
    
    if( this.state.dataPageQuery != dataPageQuery ) {
      this.fetchDP(mode);
    } 
  }

  render() {
    const { props } = this;

    return (
      <Form.Dropdown
        className="pr-field-Dropdown"
        placeholder={props.placeholder}
        labeled={props.labeled}
        fluid={props.fluid}
        selection={props.selection}
        search={props.search}
        clearable={props.clearable}
        options={this.getOptions()}
        onChange={props.onChange}
        onBlur={props.onBlur}
        reference={props.reference}
        repeatlayouttype={props.repeatlayouttype}
        value={props.value}
        required={props.required}
        disabled={props.readOnly}
        label={props.label}
        name={props.name}
        errorLabel={props.errorLabel}
        validationError={props.validationError}
        error={props.error}
        data-test-id={props.testid}
        {...props.tooltip}
      />
    );
  }
}

function mapStateToProps(state) {
  return {};
}

const connectedDataPageDropdown = connect(mapStateToProps)(DataPageDropdown);
export { connectedDataPageDropdown as DataPageDropdown };
