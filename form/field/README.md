# Ext.ux.form.field.SelectionEditor.js

Extjs 4 

Ext.form.field.HtmlEditor extension

Adds tab forward / backward selection for bracketed text, e.g. '{example}'
Cntrl-u removes the brackets from the text

## Example
###Collection
	
	var formPanel = Ext.widget('panel', {
		renderTo: Ext.get('form'),
		title: 'Selection Editor',
		width: 800,
		height: 600,
		bodyPadding: 20,

		items: [{
			xtype: 'selectioneditor',
			height: 500,
			width: 500
		}]
});