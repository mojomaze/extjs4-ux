 /*
** Overriding ZIndexManager _showModalMask
** Setting mask height to actual document rather than viewable area
** so load mask covers entire screen for long pages with scrollbars
*/
var getDocHeight = function() {
    var D = document;
    return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
}

// Override for the _showModalMask function from Ext JS 4.0.5
Ext.override(Ext.ZIndexManager, {
 	_showModalMask: function(comp) {
     var zIndex = comp.el.getStyle('zIndex') - 4,
     maskTarget = comp.floatParent ? comp.floatParent.getTargetEl() : Ext.get(comp.getEl().dom.parentNode),
     parentBox = maskTarget.getBox();

     if (!this.mask) {
         this.mask = Ext.getBody().createChild({
             cls: Ext.baseCSSPrefix + 'mask'
         });
         this.mask.setVisibilityMode(Ext.Element.DISPLAY);
         this.mask.on('click', this._onMaskClick, this);
     }
     if (maskTarget.dom === document.body) {
         parentBox.height = Ext.Element.getViewHeight();            
     }
     maskTarget.addCls(Ext.baseCSSPrefix + 'body-masked');
     this.mask.setBox(parentBox);
     this.mask.setStyle('zIndex', zIndex);
     // Fix for modal windows where the mask is not covering whole body
     if (maskTarget.dom === document.body) {
					var height = getDocHeight();
					this.mask.setHeight(height);
			}
     this.mask.show();
	}
});

 /*
** Overriding Ext.gird.PagingScroller
** Fix for scrollbar intermitantly becoming inactive
*/
Ext.override(Ext.grid.PagingScroller, {
	onElScroll: function(e, t) {
      var me = this,
          panel = me.getPanel(),
          store = panel.store,
          pageSize = store.pageSize,
          guaranteedStart = store.guaranteedStart,
          guaranteedEnd = store.guaranteedEnd,
          totalCount = store.getTotalCount(),
          numFromEdge = Math.ceil(me.percentageFromEdge * pageSize),
          position = t.scrollTop,
          visibleStart = Math.floor(position / me.rowHeight),
          view = panel.down('tableview'),
          viewEl = view.el,
          visibleHeight = viewEl.getHeight(),
          visibleAhead = Math.ceil(visibleHeight / me.rowHeight),
          visibleEnd = visibleStart + visibleAhead,
          prevPage = Math.floor(visibleStart / pageSize),
          nextPage = Math.floor(visibleEnd / pageSize) + 2,
          lastPage = Math.ceil(totalCount / pageSize),
          snap = me.snapIncrement,
          requestStart = Math.floor(visibleStart / snap) * snap,
          requestEnd = requestStart + pageSize - 1,
          activePrefetch = me.activePrefetch;

      me.visibleStart = visibleStart;
      me.visibleEnd = visibleEnd;
      
      
      me.syncScroll = true;
      if (totalCount >= pageSize) {
          
          if (requestEnd > totalCount - 1) {
              me.cancelLoad();
              if (store.rangeSatisfied(totalCount - pageSize, totalCount - 1)) {
                  me.syncScroll = true;
              }
              store.guaranteeRange(totalCount - pageSize, totalCount - 1);
          
          } else if (visibleStart <= guaranteedStart || visibleEnd > guaranteedEnd) {
              if (visibleStart <= guaranteedStart) {
                  
                  requestStart -= snap;
                  requestEnd -= snap;
                  
                  if (requestStart < 0) {
                      requestStart = 0;
                      requestEnd = pageSize;
                  }
              }
              if (store.rangeSatisfied(requestStart, requestEnd)) {
                  me.cancelLoad();
                  store.guaranteeRange(requestStart, requestEnd);
              } else {
                  store.mask();
                  me.attemptLoad(requestStart, requestEnd);
              }
              
              me.syncScroll = true;
          } else if (activePrefetch && visibleStart < (guaranteedStart + numFromEdge) && prevPage > 0) {
              me.syncScroll = true;
              store.prefetchPage(prevPage);
          } else if (activePrefetch && visibleEnd > (guaranteedEnd - numFromEdge) && nextPage < lastPage) {
              me.syncScroll = true;
              store.prefetchPage(nextPage);
          }
      }

      if (me.syncScroll) {
          me.syncTo();
      }
  }
});

 /*
** Overriding Ext.grid.Scroller
** Fix for scrollbar intermitantly becoming inactive
*/
Ext.override(Ext.grid.Scroller, {

  afterRender: function() {
    var me = this;
    me.callParent();
    me.mon(me.scrollEl, 'scroll', me.onElScroll, me);
    Ext.cache[me.el.id].skipGarbageCollection = true;
    // add another scroll event listener to check, if main listeners is active
    Ext.EventManager.addListener(me.scrollEl, 'scroll', me.onElScrollCheck, me);
    // ensure this listener doesn't get removed
    Ext.cache[me.scrollEl.id].skipGarbageCollection = true;
  },

  // flag to check, if main listeners is active
  wasScrolled: false,

  // synchronize the scroller with the bound gridviews
  onElScroll: function(event, target) {
    this.wasScrolled = true; // change flag -> show that listener is alive
    this.fireEvent('bodyscroll', event, target);
  },

  // executes just after main scroll event listener and check flag state
  onElScrollCheck: function(event, target, options) {
    var me = this;

    if (!me.wasScrolled) {
      // Achtung! Event listener was disappeared, so we'll add it again
      me.mon(me.scrollEl, 'scroll', me.onElScroll, me);
    }
    me.wasScrolled = false; // change flag to initial value
  }

});