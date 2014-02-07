custom-form
===========

Custom Form Integration

Dependencies:

* Select2 3.4.5 (http://ivaynberg.github.io/select2/)
* Masked Input 1.3.1 (http://digitalbush.com/projects/masked-input-plugin/)

Initialization:

$('.defaultForm').customForm();

Parameters:

* requiredClass: name of the classe to identify required fields. Default: 'required',
* errorClass: name of the class for field errors. Default: 'error',
* errorContainer: container for the messages. Can be a string or a jQuery element. Default: '.messages'


Methods:

* $('.defaultForm').customForm('validate') - validates the entire form, without submitting