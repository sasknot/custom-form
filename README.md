Custom Form Integration
===========

### Dependencies

* Select2 3.4.5 (http://ivaynberg.github.io/select2/)
* Masked Input 1.3.1 (http://digitalbush.com/projects/masked-input-plugin/)
* maskMoney 2.1.2 (http://github.com/plentz/jquery-maskmoney)

They are not mandatory, but some features may not work.

### Initialization

$('form').customForm( parameters );

Parameters are optional, if none or only a few are passed they get the default value.

### Parameters

Name | Description | Default
--- | --- | ---
requiredClass | Name of the classe to identify the required fields. | 'required'
errorClass | Name of the class to put in the field with errors. | 'error'
errorContainer | Container for the messages. Can be a string or a jQuery element. | '.messages'
ignoreInvisible | If true, fields that are invisble are ignored on the validation process. | true
dateFormat | The format for mask and validation of date type fields. | 'dd/mm/yyyy'
timeFormat | The format for mask and validation of time type fields. | 'hh:mm:ss'

### Methods

$('form').customForm( name, parameters );

Name | Description | Parameters
--- | --- | ---
validate | validates the entire form, without submitting | object
destroy | remove settings and binded submit event | void


### Future Development

* Remove legacy support for .state from field type .target;
* Change requiredClass to be in the field div, not in the input/textarea/select itself;
* Build apply masks funcion (the ideia is to be reusable);
* Document AJAX request variables on ajaxForm type;
* Separate the validation if's for better debugging;
* Define a regular container for form fields (that can be modified via parameters);