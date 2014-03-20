custom-form
===========

Custom Form Integration

Dependencies:

* Select2 3.4.5 (http://ivaynberg.github.io/select2/)
* Masked Input 1.3.1 (http://digitalbush.com/projects/masked-input-plugin/)
* maskMoney 2.1.2 (http://github.com/plentz/jquery-maskmoney)

They are not mandatory, but some features may not work.

Initialization:

$('.defaultForm').customForm();

Parameters:

* requiredClass: name of the classe to identify required fields. Default: 'required',
* errorClass: name of the class for field errors. Default: 'error',
* errorContainer: container for the messages. Can be a string or a jQuery element. Default: '.messages'
* ignoreInvisible: if true, the div.field that are invisble are ignored on the validation


Methods:

* $('.defaultForm').customForm('validate') - validates the entire form, without submitting