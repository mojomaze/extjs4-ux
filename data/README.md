# Ext.ux.data.Actionable.js

Extjs 4 

Ext.data.Store Mixin to allow Rails proxy actions to be called on store instead of proxy

## Example
###Collection
	
	Ext.data.Store.doAction('delete_all', records, {
		success: function(operation){
			// handle success
		},
		failure: function(operation){
			// handle failure
		}
	});

	POST /proxy_url/delete_all.json, proxy_root => '[{"id":1},{"id":2}]'

###Member
	
	Ext.data.Store.doAction('send_notice', [record], {
		success: function(operation){
			// handle success
		},
		failure: function(operation){
			// handle failure
		}
	});

	POST /proxy_url/id/send_note.json

## Usage
###Model

	Ext.define('TestApp.model.Team', {
		extend: 'Ext.data.Model',
	
		fields: [
			{ name: 'id', type: 'int' }
			,{name: 'name'}
		],
	
		proxy: {
			type: 'rails',
			url: '/teams',
			format: 'json',
			addActions: {
				destroy_all: {
					method: 'POST',
					collection: true // POST proxy_url/delete_all.json
				},
				send_notice: {
					method: 'POST',
					collection: false // POST proxy_url/id/send_notice.json
				}
			},
			reader: {
				type: 'json',
				root: 'team'
			},
			writer: {
				type: 'json',
				root: 'team',
				encode: true,
				writeAllFields: true, // set to false to only send modified fields
				allowSingle: false // send single record in array
			}
		}
	});
	
###Store

	Ext.define('TestApp.store.Teams', {
		extend: 'Ext.data.Store',
		mixins: {
			actionable: 'Ext.ux.data.Actionable'
		},
		
		singleton: true,
		requires: ['TestApp.model.Team'],
		model: 'TestApp.model.Team',
	
		storeId: 'teamStore',
		sorters: [
			{
				property: 'name',
				direction: 'ASC'
			}
		]
	});