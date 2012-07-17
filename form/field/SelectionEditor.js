/**
 * @author Mark H Winkler.
 * @class Ext.ux.form.field.SelectionEditor
 * @extends Ext.form.field.HtmlEditor
 * Adds tab forward / backward selection for bracketed text, '{example}'
 *  Cntrl-u removes the brackets from the text
*/
Ext.define('Ext.ux.form.field.SelectionEditor', {
	extend: 'Ext.form.field.HtmlEditor',
	alias: 'widget.selectioneditor',
	
	iframePad: 10,
	
	initComponent: function(){
		this.callParent(arguments);
	},
	
	// hook into parent function to handle note key commands
  applyCommand : function(e){
			var me = this;
				
			// tab search for {}
			if (e.getKey() == e.TAB) {
				if (e.shiftKey) { 
					me.findInDom('<');
				} else {
					me.findInDom();
				}
				me.win.focus();
        me.deferFocus();
        e.preventDefault();
			}
			
			// ctrl u removes {}
			if (e.ctrlKey) {
          var me = this,
              c = e.getCharCode();
          if (c > 0) {
              c = String.fromCharCode(c);
              if (c == 'u') {
                  me.stripContainer();
									me.win.focus();
					        me.deferFocus();
					        e.preventDefault();
									return; // prevent parent call for underline
              }
          }
      }
			me.callParent(arguments);
  },

	
	// override fix keys so we can trap tabs
	// private
  fixKeys: function() { // load time branching for fastest keydown performance
      if (Ext.isIE) {
          return function(e){
              var me = this,
                  k = e.getKey(),
                  doc = me.getDoc(),
                  range, target;
              if (k === e.TAB) {
									e.stopEvent();
									if (e.shiftKey) { 
										me.selectContainer('{', '}', '<');
									} else {
										me.selectContainer('{', '}');
									}
									me.deferFocus();
              }
              else if (k === e.ENTER) {
                  range = doc.selection.createRange();
                  if (range) {
                      target = range.parentElement();
                      if(!target || target.tagName.toLowerCase() !== 'li'){
                          e.stopEvent();
                          range.pasteHTML('<br />');
                          range.collapse(false);
                          range.select();
                      }
                  }
              }
							// cntrl u removes {}
							else if (k === 85){
								if (e.ctrlKey) {
									e.stopEvent();
                 	me.stripContainer();
				        	me.deferFocus();
								}
							}
          };
      }

      if (Ext.isOpera) {
          return function(e){
          	var me = this,
							k = e.getKey();
            if (k === e.TAB) {
            	e.stopEvent();
							if (e.shiftKey) { 
								me.findInDom('<');
							} else {
								me.findInDom();
							}
							me.deferFocus();
						}
						// cntrl u removes {}
						else if (k === 85){
							if (e.ctrlKey) {
								e.stopEvent();
             		me.stripContainer();
			        	me.deferFocus();
							}
						}
          };
      }

      if (Ext.isWebKit) {
          return function(e){
              var me = this,
              	k = e.getKey();
							// tab search for {}
              if (k === e.TAB) {
								e.stopEvent();
								if (e.shiftKey) { 
									me.findInDom('<');
								} else {
									me.findInDom();
								}
								me.deferFocus();
              }
              else if (k === e.ENTER) {
                  e.stopEvent();
                  me.execCmd('InsertHtml','<br /><br />');
                  me.deferFocus();
              }
							// cntrl u removes {}
							else if (k === 85){
								if (e.ctrlKey) {
									e.stopEvent();
                 	me.stripContainer();
				        	me.deferFocus();
								}
							}
          };
      }

      return null; // not needed, so null
  }(),

	getSelectionRange: function() {
		var me = this,
	    doc = me.getDoc(), 
			win = me.getWin(), sel;
			
	    if (win.getSelection) {
	        sel = win.getSelection();
	        if (sel.rangeCount) {
	            return sel.getRangeAt(0);
	        }
	    } else if (doc.selection) {
	        return doc.selection.createRange();
	    }
	    return null;
	},
	
	findString: function(str, direction) {
		var me = this,
			strFound = false, 
			win = me.getWin(),
			doc = me.getDoc(),
			range;
		
		// defualt to forward
		var direction = direction || '>';
			
		if (win.find) {
			if (direction == '>') {
				
	  		strFound=win.find(str);
		  	if (!strFound) {
					// not found forward so find backward up to first occurance
					strFound = win.find(str,0,1);
					while (win.find(str,0,1)) {
						 continue;
					}
		  	}
			} else {
				
				strFound=win.find(str,0,1);
		  	if (!strFound) {
					// not found backward so find forward up to first occurance
					strFound = win.find(str);
					while (win.find(str)) {
						 continue;
					}
		  	}
			}
	
	 	} else if (Ext.isIE) {
			// get current selection range
			range = doc.selection.createRange();
			if (direction == '>') {
				if (range) {
					range.collapse(false); // move cursor to end of selection
				} else {
					range = doc.body.createTextRange();
				}
	   		strFound = range.findText(str);
				if (!strFound) {
					// find from start of doc
					range = doc.body.createTextRange();
					strFound = range.findText(str);
				}
	   		if (strFound) {
					range.select();
				}
			} else {
				if (range) {
					range.collapse(); // move cursor to beginning of selection - default is true
				} else {
					range = doc.body.createTextRange();
				}
	   		strFound = range.findText(str, -1); // backward
				if (!strFound) {
					// find from end of doc
					range = doc.body.createTextRange();
					strFound = range.findText(str, -1);
				}
	   		if (strFound) {
					range.select();
				}
			}
		} else {
			range = me.getSelectionRange();
			var text = range.toString();
			
		}
		
		return strFound;
	},

	selectContainer: function(str1, str2, direction) {
		var me = this,
			strFound, 
			startRange,
			endRange,
			win = me.getWin(),
			doc = me.getDoc();
			
		var direction = direction || '>';
			
		strFound = me.findString(str1, direction);
		if (strFound) {
			// get selection range
			if (!Ext.isIE) {
				startRange = me.getSelectionRange();
			} else {
				startRange = doc.selection.createRange();
			}
			// always find 2nd container string forward
		 	strFound = me.findString(str2);
			
			if (strFound) {
				if (!Ext.isIE) {
					endRange = me.getSelectionRange();
				} else {
					endRange = doc.selection.createRange();
				}
				
				if (!Ext.isIE) {
					// compare ranges and select if valid
					var startContainer = startRange.startContainer;
					var endContainer = startRange.endContainer;
					var endContainer2 = endRange.endContainer;
					if (startContainer == endContainer && endContainer == endContainer2) {
						endRange.setStart(startRange.startContainer, startRange.startOffset);
						var sel = win.getSelection();
						sel.removeAllRanges();
						sel.addRange(endRange);
					}
				} else {
					// set the startRange endPoint eq to the endRange input
					startRange.setEndPoint('EndToEnd', endRange);
					startRange.select();
				}
				task = { // wait until selection is ready
            run: function() {
							Ext.TaskManager.stop(task);
            	me.handleDisplay();
            },
            interval : 10,
            duration:10000,
            scope: me
        };
        Ext.TaskManager.start(task);
			}
		}
	},
	
	findInDom: function(direction) {
		var me = this,
			found = false,
			range, node,
			direction = direction || '>';
			
		var regex = /\{[^\{^\}]*\}/gi;
		
		// search current node if one is selected
		range = me.getSelectionRange();
		if (range) {
			found = me.findInRange(range, regex, direction);
			if (!found) {
				node = range.startContainer;
			}
		}
		
		// not found so crawl dom and search textNodes
		if (!found) {
			found = me.findInTextNode(node, regex, direction);
		}
		
		// not found so wrap the search from top or bottom
		if (!found) {
			node = me.getDoc().body;
			found = me.findInTextNode(node, regex, direction);
		}
		
		// handle the display if necessary
		if (found) {
			task = { // wait until selection is ready
          run: function() {
						Ext.TaskManager.stop(task);
          	me.handleDisplay();
          },
          interval : 10,
          duration:10000,
          scope: me
      };
      Ext.TaskManager.start(task);
		}
	},
	
	findInTextNode: function(node, regex, direction) {
		var me = this,
			found = false;
		
		while (!found && node) {
			if (direction == '>') {
				node = me.nextTextNodeDown(node);
				if (node) {
					found = me.findInNode(node, regex, direction);
				} 

			} else {
				node = me.nextTextNodeUp(node);
				if (node) {
					found = me.findInNode(node, regex, direction);
				}
			}
		}
		return found;
	},
	
	nextTextNodeDown: function(node) {
		var me = this;
		if (!node) {
			return null;
		}
		
		if (node.firstChild) {
			if (node.firstChild.nodeType == 3) {
				return node.firstChild;
			}
			return me.nextTextNodeDown(node.firstChild);
	
		} else {
			if (node.nextSibling) {
				if (node.nextSibling.nodeType == 3) {
					return node.nextSibling;
				}
				return me.nextTextNodeDown(node.nextSibling);
				
			} else {
				var parent = node.parentNode;
				if (parent.nextSibling) {
					if (parent.nextSibling.nodeType == 3) {
						return parent.nextSibling
					}
					return me.nextTextNodeDown(parent.nextSibling);
				} else {
					// no next sibling so climb back until there is one
					var node = parent.parentNode;
					var found = false;
					while (node && !found) {
						if (node.nextSibling) {
							found = true;
							node = node.nextSibling;
						} else {
							node = node.parentNode;
						}
					}
					return me.nextTextNodeDown(node);
				}
			}
		}
		return null;
	},
	
	nextTextNodeUp: function(node) {
		var me = this;
		if (!node) {
			return null;
		}
		
		if (node.lastChild) {
			if (node.lastChild.nodeType == 3) {
				return node.lastChild;
			}
			return me.nextTextNodeUp(node.lastChild);
		} else {
		
			if (node.previousSibling) {
				if (node.previousSibling.nodeType == 3) {
					return node.previousSibling;
				}
				return me.nextTextNodeUp(node.previousSibling);
			} else {
				var parent = node.parentNode;
				if (parent.nodeName == "BODY") {
					return null;
				}
				if (parent.previousSibling) {
					if (parent.previousSibling.nodeType == 3) {
						return parent.previousSibling
					}
					return me.nextTextNodeUp(parent.previousSibling);
				} else {
					// no previous sibling so climb back until there is one
					var node = parent.parentNode;
						if (node.nodeName == "BODY") {
							return null;
						}
					var found = false;
					while (node && !found) {
						if (node.previousSibling) {
							found = true;
							node = node.previousSibling;
						} else {
							node = node.parentNode;
						}
					}
					if (node.nodeName == "BODY") {
						return null;
					} else {
						return me.nextTextNodeUp(node);
					}
				}
			}
		}
		return null;
	},
	
	selectInNode: function(node, start, end) {
		var me = this,
			win = me.getWin(),
			doc = me.getDoc();
			
		range = doc.createRange();
		range.setStart(node,start);
		range.setEnd(node,end);
		// remove current range
		sel = win.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	},
	
	findInNode: function(node, regex, direction) {
		var me = this,
		 	strFound,
			result, searchText;
	
		searchText = node.textContent;

		result = searchText.match(regex);

		if (result) {
			if (direction == '>') {
				strFound = result[0]; // use first item found
				startOffset = searchText.indexOf(strFound);
			} else { 
				strFound = result[result.length-1]; // use the last item found
				startOffset = searchText.lastIndexOf(strFound);
			}
			endOffset = startOffset + strFound.length;
			// make selection
			me.selectInNode(node, startOffset, endOffset);
			return true;
		}
		return false;
	},
	
	findInRange: function(range, regex, direction) {
		var me = this,
			range, searchStart, searchEnd, strFound,
			result, searchText;
			
		if (direction == '>') {
			searchStart = range.endOffset;
			searchEnd = 0;
		} else {
			if (range.startOffset == 0) { // at start of node and searching up
				return false;
			}
			searchStart = 0;
			searchEnd = range.startOffset;
		}
		
		node = range.startContainer;
	
		searchText = node.textContent;

		if (searchStart > 0 && searchEnd == 0) {
			searchText = searchText.substring(searchStart);
		} else if (searchEnd > 0) {
			searchText = searchText.substring(searchStart, searchEnd);
		}

		result = searchText.match(regex);

		if (result) {
			if (direction == '>') {
				strFound = result[0]; // use first item found
				startOffset = searchText.indexOf(strFound)+searchStart;
			} else { 
				strFound = result[result.length-1]; // use the last item found
				startOffset = searchText.lastIndexOf(strFound);
			}
			endOffset = startOffset + strFound.length;
			// make selection
			me.selectInNode(node, startOffset, endOffset);
			return true;
		}
		return false;
	},
	
	handleDisplay: function() {
		var me = this,
			range, 
			selText = '';
			
		range = me.getSelectionRange();
		if (!Ext.isIE) {
			selText = range.toString();
		} else {
			selText = range.text;
		}
		if (selText.indexOf('{d:') > -1 ) {
			alert('display window opens');
		}
	},
	
	stripContainer: function() {
		var me = this,
			selection, 
			selText = '',
			stripText = '',
			range = '',
			doc = me.getDoc();
		
		range = me.getSelectionRange();
		
		if (!Ext.isIE) {
			selText = range.toString();
		} else {
			selText = range.text;
		}
		stripText = selText.replace('{', '');
		stripText = stripText.replace('}', '');
		// call parent insert function
		me.insertAtCursor(stripText);
	}
});