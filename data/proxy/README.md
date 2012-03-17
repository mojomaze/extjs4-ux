# Ext.ux.data.proxy.Rails.js

Extjs 4 

Rails proxy extends Rest proxy to allow non-rest actions

## Example
###Collection
	
	Ext.data.Store.getProxy().doAction('delete_all', records, {
		success: function(operation){
			// handle success
		},
		failure: function(operation){
			// handle failure
		}
	});

	POST /proxy_url/delete_all.json, proxy_root => '[{"id":1},{"id":2}]'

###Member
	
	Ext.data.Store.getProxy().doAction('send_notice', [record], {
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
			url: '/widgets',
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
				root: 'widget'
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