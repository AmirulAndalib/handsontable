describe('MergeCells', () => {
  const id = 'testContainer';

  beforeEach(function() {
    this.$container = $(`<div id="${id}"></div>`).appendTo('body');
  });

  afterEach(function() {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  describe('initialization', () => {
    it('should merge cell in startup', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5),
        mergeCells: [
          { row: 0, col: 0, rowspan: 2, colspan: 2 }
        ]
      });
      const TD = hot.rootElement.querySelector('td');

      expect(TD.getAttribute('rowspan')).toBe('2');
      expect(TD.getAttribute('colspan')).toBe('2');
    });

    it('should overwrite proper cells while creating new dataset (with nulls in place of merge areas)', () => {
      const afterChange = jasmine.createSpy('afterChange');

      handsontable({
        data: [
          [null, null, 3, 4, null],
          [null, null, null, null, null],
          [null, 5, null, null, null],
        ],
        mergeCells: [{
          row: 0,
          col: 3,
          rowspan: 2,
          colspan: 2
        }, {
          row: 2,
          col: 1,
          rowspan: 1,
          colspan: 2
        }],
        afterChange,
      });

      expect(afterChange.calls.mostRecent().args[0]).toEqual([
        [0, 4, null, null],
        [1, 3, null, null],
        [1, 4, null, null],
        [2, 2, null, null],
      ]);
      expect(getSourceData()).toEqual([
        [null, null, 3, 4, null],
        [null, null, null, null, null],
        [null, 5, null, null, null],
      ]);
      expect(getData()).toEqual([
        [null, null, 3, 4, null],
        [null, null, null, null, null],
        [null, 5, null, null, null],
      ]);
    });

    it('should provide information about the source of the change in the `beforeChange` and `afterChange` hooks', () => {
      const beforeChange = jasmine.createSpy('beforeChange');
      const afterChange = jasmine.createSpy('afterChange');

      handsontable({
        data: [
          [1, 2, 3, 4],
          [5, 6, 7, 8],
          [9, 10, 11, 12],
          [13, 14, 15, 16],
        ],
        mergeCells: [{
          row: 0,
          col: 0,
          rowspan: 2,
          colspan: 2
        }],
        beforeChange,
        afterChange,
      });

      expect(beforeChange.calls.mostRecent().args[1]).toEqual('MergeCells');
      expect(afterChange.calls.mostRecent().args[1]).toEqual('MergeCells');

      getPlugin('mergeCells').merge(2, 2, 3, 3);

      expect(beforeChange.calls.mostRecent().args[1]).toEqual('MergeCells');
      expect(afterChange.calls.mostRecent().args[1]).toEqual('MergeCells');
    });

    it('should merge cells on startup respecting indexes sequence changes', () => {
      handsontable({
        data: [
          ['A1', 'B1', null, null],
          ['A2', 'B2', null, null]
        ],
        mergeCells: [{
          row: 0,
          col: 2,
          rowspan: 1,
          colspan: 2
        }, {
          row: 1,
          col: 2,
          rowspan: 1,
          colspan: 2
        }],
        manualColumnMove: [1, 0, 2, 3],
      });

      expect(getSourceData()).toEqual([['A1', 'B1', null, null], ['A2', 'B2', null, null]]);
      expect(getData()).toEqual([['B1', 'A1', null, null], ['B2', 'A2', null, null]]);
    });
  });

  describe('methods', () => {
    it('should clear merged cells collection without throw an exception', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(50, 1),
        width: 100,
        height: 100,
        mergeCells: [
          { row: 0, col: 0, rowspan: 2, colspan: 1 },
          { row: 4, col: 0, rowspan: 30, colspan: 1 },
          { row: 48, col: 0, rowspan: 2, colspan: 1 },
        ],
      });

      expect(() => {
        hot.getPlugin('mergeCells').clearCollections();
      }).not.toThrow();
    });
  });

  describe('mergeCells updateSettings', () => {
    it('should allow to overwrite the initial settings using the updateSettings method', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 10),
        mergeCells: [
          { row: 0, col: 0, rowspan: 2, colspan: 2 }
        ]
      });
      let TD = hot.rootElement.querySelector('td');

      expect(TD.getAttribute('rowspan')).toBe('2');
      expect(TD.getAttribute('colspan')).toBe('2');

      updateSettings({
        mergeCells: [
          { row: 2, col: 2, rowspan: 2, colspan: 2 }
        ]
      });

      TD = hot.rootElement.querySelector('td');
      expect(TD.getAttribute('rowspan')).toBe(null);
      expect(TD.getAttribute('colspan')).toBe(null);

      TD = getCell(2, 2);

      expect(TD.getAttribute('rowspan')).toBe('2');
      expect(TD.getAttribute('colspan')).toBe('2');
    });

    it('should allow resetting the merged cells by changing it to an empty array', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 10),
        mergeCells: [
          { row: 0, col: 0, rowspan: 2, colspan: 2 }
        ]
      });
      let TD = hot.rootElement.querySelector('td');

      expect(TD.getAttribute('rowspan')).toBe('2');
      expect(TD.getAttribute('colspan')).toBe('2');

      updateSettings({
        mergeCells: []
      });

      TD = hot.rootElement.querySelector('td');
      expect(TD.getAttribute('rowspan')).toBe(null);
      expect(TD.getAttribute('colspan')).toBe(null);
    });

    it('should allow resetting and turning off the mergeCells plugin by changing mergeCells to \'false\'', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 10),
        mergeCells: [
          { row: 0, col: 0, rowspan: 2, colspan: 2 }
        ]
      });
      let TD = hot.rootElement.querySelector('td');

      expect(TD.getAttribute('rowspan')).toBe('2');
      expect(TD.getAttribute('colspan')).toBe('2');

      updateSettings({
        mergeCells: false
      });

      TD = hot.rootElement.querySelector('td');
      expect(TD.getAttribute('rowspan')).toBe(null);
      expect(TD.getAttribute('colspan')).toBe(null);
    });
  });

  describe('mergeCells copy', () => {
    it('should not copy text of cells that are merged into another cell', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5),
        mergeCells: [
          { row: 0, col: 0, rowspan: 2, colspan: 2 }
        ]
      });

      expect(hot.getCopyableText(0, 0, 2, 2)).toBe('A1\t\tC1\n\t\tC2\nA3\tB3\tC3');
    });
  });

  describe('merged cells selection', () => {
    it('should not change the selection after toggling the merge/unmerge state', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: true
      });

      selectCell(2, 2, 4, 4);
      keyDownUp(['control', 'm']);

      const mergedCell = getCell(2, 2);

      expect(mergedCell.rowSpan).toBe(3);
      expect(mergedCell.colSpan).toBe(3);
      expect(getSelected()).toEqual([[2, 2, 4, 4]]);

      keyDownUp(['control', 'm']);

      expect(mergedCell.rowSpan).toBe(1);
      expect(mergedCell.colSpan).toBe(1);
      expect(getSelected()).toEqual([[2, 2, 4, 4]]);
    });

    it('should select the whole range of cells which form a merged cell', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(4, 4),
        mergeCells: [
          {
            row: 0,
            col: 0,
            colspan: 4,
            rowspan: 1
          }
        ]
      });

      const $table = spec().$container.find('table.htCore');
      const $td = $table.find('tr:eq(0) td:eq(0)');

      expect($td.attr('rowspan')).toEqual('1');
      expect($td.attr('colspan')).toEqual('4');

      expect(hot.getSelectedLast()).toBeUndefined();

      hot.selectCell(0, 0);

      expect(hot.getSelectedLast()).toEqual([0, 0, 0, 3]);

      deselectCell();

      hot.selectCell(0, 1);

      expect(hot.getSelectedLast()).toEqual([0, 0, 0, 3]);
    });

    it('should always make a rectangular selection, when selecting merged and not merged cells', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(4, 4),
        mergeCells: [
          {
            row: 1,
            col: 1,
            colspan: 3,
            rowspan: 2
          }
        ]
      });

      const $table = spec().$container.find('table.htCore');
      const $td = $table.find('tr:eq(1) td:eq(1)');

      expect($td.attr('rowspan')).toEqual('2');
      expect($td.attr('colspan')).toEqual('3');

      expect(hot.getSelectedLast()).toBeUndefined();

      hot.selectCell(0, 0);

      expect(hot.getSelectedLast()).toEqual([0, 0, 0, 0]);

      deselectCell();

      hot.selectCell(0, 0, 1, 1);

      expect(hot.getSelectedLast()).not.toEqual([0, 0, 1, 1]);
      expect(hot.getSelectedLast()).toEqual([0, 0, 2, 3]);

      deselectCell();

      hot.selectCell(0, 1, 1, 1);

      expect(hot.getSelectedLast()).toEqual([0, 1, 2, 3]);
    });

    it('should not switch the selection start point when selecting from non-merged cells to merged cells', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 10),
        mergeCells: [
          { row: 1, col: 1, rowspan: 3, colspan: 3 },
          { row: 3, col: 4, rowspan: 2, colspan: 2 }
        ]
      });

      $(hot.getCell(6, 6)).simulate('mousedown');

      expect(hot.getSelectedRangeLast().from.col).toEqual(6);
      expect(hot.getSelectedRangeLast().from.row).toEqual(6);

      $(hot.getCell(1, 1)).simulate('mouseenter');

      expect(hot.getSelectedRangeLast().from.col).toEqual(6);
      expect(hot.getSelectedRangeLast().from.row).toEqual(6);

      $(hot.getCell(3, 3)).simulate('mouseenter');

      expect(hot.getSelectedRangeLast().from.col).toEqual(6);
      expect(hot.getSelectedRangeLast().from.row).toEqual(6);

      $(hot.getCell(4, 4)).simulate('mouseenter');

      expect(hot.getSelectedRangeLast().from.col).toEqual(6);
      expect(hot.getSelectedRangeLast().from.row).toEqual(6);

    });

    // TODO: After some changes please take a look at #7010.
    it('should select cells in the correct direction when changing selections around a merged range', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 10),
        mergeCells: [
          { row: 4, col: 4, rowspan: 2, colspan: 2 }
        ]
      });

      hot.selectCell(5, 5, 5, 2);
      expect(hot.getSelectedRangeLast().getDirection()).toEqual('SE-NW');
      // Rectangular area from the marginal cell to the cell on the opposite.
      expect(hot.getSelected()).toEqual([[5, 5, 4, 2]]);

      // What about, for example: hot.selectCell(5, 4, 5, 2);
      // Is it specified properly?

      hot.selectCell(4, 4, 2, 5);
      expect(hot.getSelectedRangeLast().getDirection()).toEqual('SW-NE');
      // It flips the selection direction vertically.
      expect(hot.getSelected()).toEqual([[5, 4, 2, 5]]);

      hot.selectCell(4, 4, 5, 7);
      expect(hot.getSelectedRangeLast().getDirection()).toEqual('NW-SE');
      expect(hot.getSelected()).toEqual([[4, 4, 5, 7]]);

      hot.selectCell(4, 5, 7, 5);
      expect(hot.getSelectedRangeLast().getDirection()).toEqual('NE-SW');
      // It flips the selection direction horizontally.
      expect(hot.getSelected()).toEqual([[4, 5, 7, 4]]);
    });

    it('should not add an area class to the selected cell if a single merged cell is selected', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(6, 6),
        mergeCells: [
          {
            row: 1,
            col: 1,
            colspan: 3,
            rowspan: 2
          }
        ]
      });

      selectCell(1, 1);
      expect(getCell(1, 1).className.indexOf('area')).toEqual(-1);

      selectCell(1, 1, 4, 4);
      expect(getCell(1, 1).className.indexOf('area')).not.toEqual(-1);

      selectCell(1, 1);
      expect(getCell(1, 1).className.indexOf('area')).toEqual(-1);

      selectCell(0, 0);
      expect(getCell(1, 1).className.indexOf('area')).toEqual(-1);
    });

    it('should render fill handle after merge cells', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: true
      });

      const plugin = hot.getPlugin('mergeCells');

      hot.selectCell(0, 0, 2, 2);
      plugin.mergeSelection();

      expect(spec().$container.find('.wtBorder.current.corner:visible').length).toEqual(1);
    });

    it('should render fill handle when merge cells is highlighted cell in right bottom corner', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: [
          { row: 2, col: 2, rowspan: 2, colspan: 2 }
        ]
      });

      hot.selectCell(2, 2, 1, 1);

      expect(spec().$container.find('.wtBorder.corner:visible').length).toEqual(1);
    });

    it('should render fill handle when cell in right bottom corner is a merged cell', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: [
          { row: 2, col: 2, rowspan: 2, colspan: 2 }
        ]
      });

      hot.selectCell(1, 1, 2, 2);

      expect(spec().$container.find('.wtBorder.corner:visible').length).toEqual(1);
    });

    it('should select the cell in the top-left corner of the merged cell, when navigating down using the ENTER key on the' +
      ' bottom edge of the table', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        autoWrapRow: true,
        autoWrapCol: true,
        mergeCells: [
          { row: 8, col: 8, rowspan: 2, colspan: 2 }
        ]
      });

      hot.setDataAtCell(8, 8, 'top-left-corner!');

      hot.selectCell(7, 9);

      keyDownUp('enter');
      keyDownUp('enter');
      keyDownUp('enter');

      expect(spec().$container.find('.handsontableInputHolder textarea').val()).toEqual('top-left-corner!');

      keyDownUp('enter');
      keyDownUp('enter');

      expect(spec().$container.find('.handsontableInputHolder textarea').val()).toEqual('A1');

      keyDownUp('enter');
      keyDownUp('enter');

      expect(spec().$container.find('.handsontableInputHolder textarea').val()).toEqual('A2');
    });

    it('should not select the cell in the top-left corner of the merged cell, when navigating down using the TAB key on the' +
      ' bottom edge of the table', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: [
          { row: 8, col: 8, rowspan: 2, colspan: 2 }
        ],
        autoWrapCol: false,
        autoWrapRow: false
      });

      hot.setDataAtCell(8, 8, 'top-left-corner!');

      hot.selectCell(9, 7);

      keyDownUp('enter');
      keyDownUp('tab');
      keyDownUp('enter');

      expect(spec().$container.find('.handsontableInputHolder textarea').val()).toEqual('top-left-corner!');

      keyDownUp('tab');
      keyDownUp('enter');

      expect(spec().$container.find('.handsontableInputHolder textarea').val()).toEqual('');

      keyDownUp('tab');
      keyDownUp('enter');

      expect(spec().$container.find('.handsontableInputHolder textarea').val()).toEqual('');
    });

    it('should select the cell in the top-left corner of the merged cell, when navigating down using the SHIFT + ENTER key on the' +
      ' top edge of the table', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: [
          { row: 0, col: 0, rowspan: 2, colspan: 2 }
        ],
        autoWrapCol: false,
        autoWrapRow: false
      });

      hot.setDataAtCell(0, 0, 'top-left-corner!');

      hot.selectCell(2, 1);

      keyDownUp(['shift', 'enter']);
      keyDownUp(['shift', 'enter']);
      keyDownUp(['shift', 'enter']);

      expect(spec().$container.find('.handsontableInputHolder textarea').val()).toEqual('top-left-corner!');

      keyDownUp(['shift', 'enter']);
      keyDownUp(['shift', 'enter']);

      expect(spec().$container.find('.handsontableInputHolder textarea').val()).toEqual('top-left-corner!');

      keyDownUp(['shift', 'enter']);
      keyDownUp(['shift', 'enter']);

      expect(spec().$container.find('.handsontableInputHolder textarea').val()).toEqual('top-left-corner!');
    });

    it('should select the cell in the top-left corner of the merged cell, when navigating down using the SHIFT + TAB key on the' +
      ' top edge of the table', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: [
          { row: 0, col: 0, rowspan: 2, colspan: 2 }
        ],
        autoWrapRow: true,
        autoWrapCol: true,
      });

      hot.setDataAtCell(0, 0, 'top-left-corner!');

      hot.selectCell(1, 2);

      keyDownUp(['shift', 'enter']);
      keyDownUp(['shift', 'tab']);
      keyDownUp(['shift', 'enter']);

      expect(spec().$container.find('.handsontableInputHolder textarea').val()).toEqual('top-left-corner!');

      keyDownUp(['shift', 'tab']);
      keyDownUp(['shift', 'enter']);

      expect(spec().$container.find('.handsontableInputHolder textarea').val()).toEqual('J1');

      keyDownUp(['shift', 'tab']);
      keyDownUp(['shift', 'enter']);

      expect(spec().$container.find('.handsontableInputHolder textarea').val()).toEqual('I1');
    });

    describe('compatibility with other plugins', () => {
      it('should be possible to traverse through columns using the DOWN ARROW or ENTER, when there\'s a' +
        ' partially-hidden merged cell in the way', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(4, 4),
          hiddenColumns: {
            columns: [1],
            indicators: true
          },
          mergeCells: [
            { row: 1, col: 1, rowspan: 2, colspan: 2 }
          ]
        });

        selectCell(0, 2);

        keyDownUp('enter');
        keyDownUp('enter');

        let lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(2, 2));

        keyDownUp('enter');
        keyDownUp('enter');

        lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(3, 2));

        selectCell(0, 2);

        keyDownUp('arrowdown');

        lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(2, 2));

        keyDownUp('arrowdown');

        lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(3, 2));
      });

      it('should be possible to traverse through columns using the UP ARROW or SHIFT+ENTER, when there\'s a' +
        ' partially-hidden merged cell in the way', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(4, 4),
          hiddenColumns: {
            columns: [1],
            indicators: true
          },
          mergeCells: [
            { row: 1, col: 1, rowspan: 2, colspan: 2 }
          ]
        });

        selectCell(3, 2);

        keyDownUp(['shift', 'enter']);
        keyDownUp(['shift', 'enter']);

        let lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(2, 2));

        keyDownUp(['shift', 'enter']);
        keyDownUp(['shift', 'enter']);

        lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(0, 2));

        selectCell(3, 2);

        keyDownUp('arrowup');

        lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(2, 2));

        keyDownUp('arrowup');

        lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(0, 2));
      });

      it('should be possible to traverse through columns using the RIGHT ARROW or TAB, when there\'s a' +
        ' partially-hidden merged cell in the way', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(4, 4),
          hiddenRows: {
            rows: [1],
            indicators: true
          },
          mergeCells: [
            { row: 1, col: 1, rowspan: 2, colspan: 2 }
          ]
        });

        selectCell(2, 0);

        keyDownUp('tab');

        let lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(2, 2));

        keyDownUp('tab');

        lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(2, 3));

        selectCell(2, 0);

        keyDownUp('arrowright');

        lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(2, 2));

        keyDownUp('arrowright');

        lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(2, 3));
      });

      it('should be possible to traverse through columns using the LEFT ARROW or SHIFT+TAB, when there\'s a' +
        ' partially-hidden merged cell in the way', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(4, 4),
          hiddenRows: {
            rows: [1],
            indicators: true
          },
          mergeCells: [
            { row: 1, col: 1, rowspan: 2, colspan: 2 }
          ]
        });

        selectCell(2, 3);

        keyDownUp(['shift', 'tab']);

        let lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(2, 2));

        keyDownUp(['shift', 'tab']);

        lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(2, 0));

        selectCell(2, 3);

        keyDownUp('arrowleft');

        lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(2, 2));

        keyDownUp('arrowleft');

        lastSelectedRange = getSelectedRangeLast();

        expect(getCell(lastSelectedRange.highlight.row, lastSelectedRange.highlight.col)).toEqual(getCell(2, 0));
      });
    });
  });

  describe('merged cells scroll', () => {
    it('getCell should return merged cell parent', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5),
        mergeCells: [
          { row: 0, col: 0, rowspan: 2, colspan: 2 }
        ],
        height: 100,
        width: 400
      });

      const mergedCellParent = hot.getCell(0, 0);
      const mergedCellHidden = hot.getCell(1, 1);

      expect(mergedCellHidden).toBe(mergedCellParent);
    });

    it('should scroll viewport to beginning of a merged cell when it\'s clicked', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5),
        mergeCells: [
          { row: 5, col: 0, rowspan: 2, colspan: 2 }
        ],
        height: 100,
        width: 400
      });

      const mainHolder = hot.view._wt.wtTable.holder;

      mainHolder.scrollTop = 130;
      hot.render();

      expect(mainHolder.scrollTop).toBe(130);

      let TD = hot.getCell(5, 0);

      mouseDown(TD);
      mouseUp(TD);
      const mergedCellScrollTop = mainHolder.scrollTop;

      expect(mergedCellScrollTop).toBeLessThan(130);
      expect(mergedCellScrollTop).toBeGreaterThan(0);

      mainHolder.scrollTop = 0;
      hot.render();

      mainHolder.scrollTop = 130;
      hot.render();

      TD = hot.getCell(5, 2);
      mouseDown(TD);
      mouseUp(TD);
      const regularCellScrollTop = mainHolder.scrollTop;

      expect(mergedCellScrollTop).toBe(regularCellScrollTop);
    });

    it('should render whole merged cell even when most rows are not in the viewport - scrolled to top', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(40, 5),
        mergeCells: [
          { row: 1, col: 0, rowspan: 21, colspan: 2 },
          { row: 21, col: 2, rowspan: 18, colspan: 2 }
        ],
        height: 100,
        width: 400
      });

      expect(hot.countRenderedRows()).toBe(39);
    });

    it('should render whole merged cell even when most rows are not in the viewport - scrolled to bottom', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(40, 5),
        mergeCells: [
          { row: 1, col: 0, rowspan: 21, colspan: 2 },
          { row: 21, col: 2, rowspan: 18, colspan: 2 }
        ],
        height: 100,
        width: 400
      });

      const mainHolder = hot.view._wt.wtTable.holder;

      $(mainHolder).scrollTop(99999);
      hot.render();

      expect(hot.countRenderedRows()).toBe(39);
    });

    it('should render whole merged cell even when most columns are not in the viewport - scrolled to the left', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(5, 40),
        mergeCells: [
          { row: 0, col: 1, rowspan: 2, colspan: 21 },
          { row: 2, col: 21, rowspan: 2, colspan: 18 }
        ],
        height: 100,
        width: 400
      });

      expect(hot.countRenderedCols()).toBe(39);
    });

    it('should render whole merged cell even when most columns are not in the viewport - scrolled to the right', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(5, 40),
        mergeCells: [
          { row: 0, col: 1, rowspan: 2, colspan: 21 },
          { row: 2, col: 21, rowspan: 2, colspan: 18 }
        ],
        height: 100,
        width: 400
      });

      spec().$container.scrollLeft(99999);
      hot.render();

      expect(hot.countRenderedCols()).toBe(39);
    });
  });

  describe('merge cells shift', () => {
    it('should shift the merged cells right, when inserting a column on the left side of them', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: [
          { row: 1, col: 1, rowspan: 2, colspan: 2 },
          { row: 2, col: 5, rowspan: 2, colspan: 2 }
        ],
        height: 400,
        width: 400
      });

      hot.alter('insert_col_start', 3, 2);

      const plugin = hot.getPlugin('mergeCells');
      const mergedCellsCollection = plugin.mergedCellsCollection.mergedCells;

      expect(mergedCellsCollection[0].col).toEqual(1);
      expect(mergedCellsCollection[1].col).toEqual(7);
    });

    it('should shift the merged cells left, when removing a column on the left side of them', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: [
          { row: 1, col: 1, rowspan: 2, colspan: 2 },
          { row: 2, col: 5, rowspan: 2, colspan: 2 }
        ],
        height: 400,
        width: 400
      });

      hot.alter('remove_col', 3, 2);

      const plugin = hot.getPlugin('mergeCells');
      const mergedCellsCollection = plugin.mergedCellsCollection.mergedCells;

      expect(mergedCellsCollection[0].col).toEqual(1);
      expect(mergedCellsCollection[1].col).toEqual(3);

    });

    it('should shift the merged cells down, when inserting rows above them', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: [
          { row: 1, col: 1, rowspan: 2, colspan: 2 },
          { row: 5, col: 5, rowspan: 2, colspan: 2 }
        ],
        height: 400,
        width: 400
      });

      hot.alter('insert_row_above', 3, 2);

      const plugin = hot.getPlugin('mergeCells');
      const mergedCellsCollection = plugin.mergedCellsCollection.mergedCells;

      expect(mergedCellsCollection[0].row).toEqual(1);
      expect(mergedCellsCollection[1].row).toEqual(7);
    });

    it('should shift the merged cells up, when removing rows above them', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: [
          { row: 1, col: 1, rowspan: 2, colspan: 2 },
          { row: 5, col: 5, rowspan: 2, colspan: 2 }
        ],
        height: 400,
        width: 400
      });

      hot.alter('remove_row', 3, 2);

      const plugin = hot.getPlugin('mergeCells');
      const mergedCellsCollection = plugin.mergedCellsCollection.mergedCells;

      expect(mergedCellsCollection[0].row).toEqual(1);
      expect(mergedCellsCollection[1].row).toEqual(3);
    });

    it('should trim the merged cell\'s height, when removing rows between their start and end', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: [
          { row: 1, col: 1, rowspan: 5, colspan: 3 }
        ],
        height: 400,
        width: 400
      });

      hot.alter('remove_row', 2, 2);

      const plugin = hot.getPlugin('mergeCells');
      const mergedCellsCollection = plugin.mergedCellsCollection.mergedCells;

      expect(mergedCellsCollection[0].row).toEqual(1);
      expect(mergedCellsCollection[0].rowspan).toEqual(3);

      plugin.mergedCellsCollection.clear();
      plugin.merge(1, 1, 2, 2);

      hot.alter('remove_row', 2, 2);

      expect(mergedCellsCollection[0].row).toEqual(1);
      expect(mergedCellsCollection[0].rowspan).toEqual(1);
    });

    it('should trim the merged cell\'s width, when removing columns between their start and end', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: [
          { row: 1, col: 1, rowspan: 3, colspan: 5 }
        ],
        height: 400,
        width: 400
      });

      hot.alter('remove_col', 2, 2);

      const plugin = hot.getPlugin('mergeCells');
      const mergedCellsCollection = plugin.mergedCellsCollection.mergedCells;

      expect(mergedCellsCollection[0].col).toEqual(1);
      expect(mergedCellsCollection[0].colspan).toEqual(3);

      plugin.mergedCellsCollection.clear();
      plugin.merge(1, 1, 2, 2);

      hot.alter('remove_col', 2, 2);

      expect(mergedCellsCollection[0].col).toEqual(1);
      expect(mergedCellsCollection[0].colspan).toEqual(1);
    });

    it('should shift the `row` of a merged cells, when removing rows consisting it', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: [
          { row: 5, col: 5, rowspan: 5, colspan: 3 }
        ],
        height: 400,
        width: 400
      });

      hot.alter('remove_row', 4, 3);

      const plugin = hot.getPlugin('mergeCells');
      const mergedCellsCollection = plugin.mergedCellsCollection.mergedCells;

      expect(mergedCellsCollection[0].row).toEqual(4);
      expect(mergedCellsCollection[0].rowspan).toEqual(3);

      plugin.mergedCellsCollection.clear();
      plugin.merge(1, 1, 2, 2);

      hot.alter('remove_row', 0, 2);

      expect(mergedCellsCollection[0].row).toEqual(0);
      expect(mergedCellsCollection[0].rowspan).toEqual(1);

      plugin.mergedCellsCollection.clear();
      plugin.merge(1, 1, 2, 2);

      hot.alter('remove_row', 1, 1);

      expect(mergedCellsCollection[0].row).toEqual(1);
      expect(mergedCellsCollection[0].rowspan).toEqual(1);
    });

    it('should shift the `col` of a merged cells, when removing columns consisting it', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: [
          { row: 5, col: 5, rowspan: 3, colspan: 5 }
        ],
        height: 400,
        width: 400
      });

      hot.alter('remove_col', 4, 3);

      const plugin = hot.getPlugin('mergeCells');
      const mergedCellsCollection = plugin.mergedCellsCollection.mergedCells;

      expect(mergedCellsCollection[0].col).toEqual(4);
      expect(mergedCellsCollection[0].colspan).toEqual(3);

      plugin.mergedCellsCollection.clear();
      plugin.merge(1, 1, 2, 2);

      hot.alter('remove_col', 0, 2);

      expect(mergedCellsCollection[0].col).toEqual(0);
      expect(mergedCellsCollection[0].colspan).toEqual(1);

      plugin.mergedCellsCollection.clear();
      plugin.merge(1, 1, 2, 2);

      hot.alter('remove_col', 1, 1);

      expect(mergedCellsCollection[0].col).toEqual(1);
      expect(mergedCellsCollection[0].colspan).toEqual(1);
    });

    it('should allow removing multiple merged cells, while removing multiple rows', () => {
      const errorSpy = spyOn(console, 'error');
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: [
          { row: 0, col: 0, rowspan: 2, colspan: 2 },
          { row: 5, col: 5, rowspan: 3, colspan: 3 }
        ],
        height: 400,
        width: 400
      });

      hot.alter('remove_row', 0, 10);

      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('merged cell candidates validation', () => {
    it('should check if the provided merged cell information object contains negative values, and if so, do not add it ' +
      'to the collection and throw an appropriate warning', () => {
      const warnSpy = spyOn(console, 'warn');
      const newMergedCells = [
        {
          row: 0,
          col: 1,
          rowspan: 3,
          colspan: 4
        },
        {
          row: -5,
          col: 8,
          rowspan: 3,
          colspan: 4
        },
        {
          row: 20,
          col: -21,
          rowspan: 3,
          colspan: 4
        },
        {
          row: 200,
          col: 210,
          rowspan: -3,
          colspan: 4
        },
        {
          row: 220,
          col: 220,
          rowspan: 3,
          colspan: -4
        }];
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: newMergedCells
      });

      expect(warnSpy)
        .toHaveBeenCalledWith('The merged cell declared with {row: -5, col: 8, rowspan: 3, colspan: 4} ' +
          'contains negative values, which is not supported. It will not be added to the collection.');
      expect(warnSpy)
        .toHaveBeenCalledWith('The merged cell declared with {row: 20, col: -21, rowspan: 3, colspan: 4} ' +
          'contains negative values, which is not supported. It will not be added to the collection.');
      expect(warnSpy)
        .toHaveBeenCalledWith('The merged cell declared with {row: 200, col: 210, rowspan: -3, colspan: 4} ' +
          'contains negative values, which is not supported. It will not be added to the collection.');
      expect(warnSpy)
        .toHaveBeenCalledWith('The merged cell declared with {row: 220, col: 220, rowspan: 3, colspan: -4} ' +
          'contains negative values, which is not supported. It will not be added to the collection.');

      expect(hot.getPlugin('mergeCells').mergedCellsCollection.mergedCells.length).toEqual(1);
    });

    it('should check if the provided merged cell information object has rowspan and colspan declared as 0, and if so, do not add it ' +
      'to the collection and throw an appropriate warning', () => {
      const warnSpy = spyOn(console, 'warn');
      const newMergedCells = [
        {
          row: 0,
          col: 1,
          rowspan: 3,
          colspan: 4
        },
        {
          row: 6,
          col: 6,
          rowspan: 0,
          colspan: 0
        },
        {
          row: 9,
          col: 9,
          rowspan: 1,
          colspan: 0
        }
      ];
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: newMergedCells
      });

      expect(warnSpy).toHaveBeenCalledWith('The merged cell declared at [6, 6] has "rowspan" or ' +
        '"colspan" declared as "0", which is not supported. It cannot be added to the collection.');
      expect(warnSpy).toHaveBeenCalledWith('The merged cell declared at [9, 9] has "rowspan" or ' +
        '"colspan" declared as "0", which is not supported. It cannot be added to the collection.');

      expect(hot.getPlugin('mergeCells').mergedCellsCollection.mergedCells.length).toEqual(1);
    });

    it('should check if the provided merged cell information object represents a single cell, and if so, do not add it ' +
      'to the collection and throw an appropriate warning', () => {
      const warnSpy = spyOn(console, 'warn');
      const newMergedCells = [
        {
          row: 0,
          col: 1,
          rowspan: 3,
          colspan: 4
        },
        {
          row: 5,
          col: 8,
          rowspan: 1,
          colspan: 1
        },
        {
          row: 20,
          col: 21,
          rowspan: 3,
          colspan: 4
        }
      ];
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(30, 30),
        mergeCells: newMergedCells
      });

      expect(warnSpy).toHaveBeenCalledWith('The merged cell declared at [5, 8] has both "rowspan" and "colspan" ' +
        'declared as "1", which makes it a single cell. It cannot be added to the collection.');
      expect(hot.getPlugin('mergeCells').mergedCellsCollection.mergedCells.length).toEqual(2);
    });

    it('should check if the provided merged cell information object contains merged declared out of bounds, and if so, ' +
      'do not add it to the collection and throw an appropriate warning', () => {
      const warnSpy = spyOn(console, 'warn');
      const newMergedCells = [
        {
          row: 0,
          col: 1,
          rowspan: 3,
          colspan: 4
        },
        {
          row: 17,
          col: 17,
          rowspan: 5,
          colspan: 5
        },
        {
          row: 20,
          col: 21,
          rowspan: 3,
          colspan: 4
        }
      ];
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(20, 20),
        mergeCells: newMergedCells
      });

      expect(warnSpy).toHaveBeenCalledWith('The merged cell declared at [17, 17] is positioned ' +
        '(or positioned partially) outside of the table range. It was not added to the table, please fix your setup.');
      expect(warnSpy).toHaveBeenCalledWith('The merged cell declared at [20, 21] is positioned ' +
        '(or positioned partially) outside of the table range. It was not added to the table, please fix your setup.');
      expect(hot.getPlugin('mergeCells').mergedCellsCollection.mergedCells.length).toEqual(1);
    });
  });

  xdescribe('canMergeRange', () => {
    it('should return false if start and end cell is the same', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5)
      });
      const mergeCells = new Handsontable.plugins.MergeCells(hot);
      const result = mergeCells.canMergeRange({
        from: {
          row: 0, col: 1
        },
        to: {
          row: 0, col: 1
        }
      });

      expect(result).toBe(false);
    });

    it('should return true for 2 consecutive cells in the same column', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5)
      });
      const mergeCells = new Handsontable.plugins.MergeCells(hot);
      const result = mergeCells.canMergeRange({
        from: {
          row: 0, col: 1
        },
        to: {
          row: 1, col: 1
        }
      });

      expect(result).toBe(true);
    });

    it('should return true for 2 consecutive cells in the same row', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5)
      });
      const mergeCells = hot.getPlugin('mergeCells');
      const result = mergeCells.canMergeRange({
        from: {
          row: 0, col: 1
        },
        to: {
          row: 0, col: 2
        }
      });

      expect(result).toBe(true);
    });

    it('should return true for 4 neighboring cells', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5)
      });
      const mergeCells = hot.getPlugin('mergeCells');
      const result = mergeCells.canMergeRange({
        from: {
          row: 0, col: 1
        },
        to: {
          row: 1, col: 2
        }
      });

      expect(result).toBe(true);
    });
  });

  xdescribe('modifyTransform', () => {
    it('should not transform arrow right when entering a merged cell', () => {
      const mergeCellsSettings = [
        { row: 1, col: 1, rowspan: 3, colspan: 3 }
      ];
      const coords = new CellCoords(1, 0);
      const currentSelection = new CellRange(coords, coords, coords);
      const mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      const inDelta = new CellCoords(0, 1);

      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(0, 1));
    });

    it('should transform arrow right when leaving a merged cell', () => {
      const mergeCellsSettings = [
        { row: 1, col: 1, rowspan: 3, colspan: 3 }
      ];
      const coords = new CellCoords(1, 1);
      const currentSelection = new CellRange(coords, coords, coords);
      const mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      const inDelta = new CellCoords(0, 1);

      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(0, 3));
    });

    it('should transform arrow right when leaving a merged cell (return to desired row)', () => {
      const mergeCellsSettings = [
        { row: 1, col: 1, rowspan: 3, colspan: 3 }
      ];
      const mergeCells = new Handsontable.MergeCells(mergeCellsSettings);

      let coords = new CellCoords(2, 0);
      let currentSelection = new CellRange(coords, coords, coords);
      let inDelta = new CellCoords(0, 1);

      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(-1, 1));

      coords = new CellCoords(1, 1);
      currentSelection = new CellRange(coords, coords, coords);
      inDelta = new CellCoords(0, 1);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(1, 3));
    });

    it('should transform arrow left when entering a merged cell', () => {
      const mergeCellsSettings = [
        { row: 1, col: 1, rowspan: 3, colspan: 3 }
      ];
      const coords = new CellCoords(1, 4);
      const currentSelection = new CellRange(coords, coords, coords);
      const mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      const inDelta = new CellCoords(0, -1);

      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(0, -3));
    });

    it('should not transform arrow left when leaving a merged cell', () => {
      const mergeCellsSettings = [
        { row: 1, col: 1, rowspan: 3, colspan: 3 }
      ];
      const coords = new CellCoords(1, 1);
      const currentSelection = new CellRange(coords, coords, coords);
      const mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      const inDelta = new CellCoords(0, -1);

      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(0, -1));
    });

    it('should transform arrow left when leaving a merged cell (return to desired row)', () => {
      const mergeCellsSettings = [
        { row: 1, col: 1, rowspan: 3, colspan: 3 }
      ];
      const mergeCells = new Handsontable.MergeCells(mergeCellsSettings);

      let coords = new CellCoords(2, 4);
      let currentSelection = new CellRange(coords, coords, coords);
      let inDelta = new CellCoords(0, -1);

      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(-1, -3));

      coords = new CellCoords(1, 1);
      currentSelection = new CellRange(coords, coords, coords);
      inDelta = new CellCoords(0, -1);
      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(1, -1));
    });

    it('should not transform arrow down when entering a merged cell', () => {
      const mergeCellsSettings = [
        { row: 1, col: 1, rowspan: 3, colspan: 3 }
      ];
      const coords = new CellCoords(0, 1);
      const currentSelection = new CellRange(coords, coords, coords);
      const mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      const inDelta = new CellCoords(0, -1);

      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(0, -1));
    });

    it('should transform arrow down when leaving a merged cell', () => {
      const mergeCellsSettings = [
        { row: 1, col: 1, rowspan: 3, colspan: 3 }
      ];
      const coords = new CellCoords(1, 1);
      const currentSelection = new CellRange(coords, coords, coords);
      const mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      const inDelta = new CellCoords(1, 0);

      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(3, 0));
    });

    it('should transform arrow up when entering a merged cell', () => {
      const mergeCellsSettings = [
        { row: 1, col: 1, rowspan: 3, colspan: 3 }
      ];
      const coords = new CellCoords(4, 1);
      const currentSelection = new CellRange(coords, coords, coords);
      const mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      const inDelta = new CellCoords(-1, 0);

      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(-3, 0));
    });

    it('should not transform arrow up when leaving a merged cell', () => {
      const mergeCellsSettings = [
        { row: 1, col: 1, rowspan: 3, colspan: 3 }
      ];
      const coords = new CellCoords(1, 1);
      const currentSelection = new CellRange(coords, coords, coords);
      const mergeCells = new Handsontable.MergeCells(mergeCellsSettings);
      const inDelta = new CellCoords(-1, 0);

      mergeCells.modifyTransform('modifyTransformStart', currentSelection, inDelta);

      expect(inDelta).toEqual(new CellCoords(-1, 0));
    });
  });

  describe('ContextMenu', () => {
    it('should disable `Merge cells` context menu item when context menu was triggered from corner header', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(10, 5),
        rowHeaders: true,
        colHeaders: true,
        contextMenu: true,
        mergeCells: true,
      });

      const corner = $('.ht_clone_top_inline_start_corner .htCore').find('thead').find('th').eq(0);

      simulateClick(corner, 'RMB');
      contextMenu();

      expect($('.htContextMenu tbody td.htDisabled').text()).toBe([
        'Insert column left',
        'Insert column right',
        'Remove columns',
        'Undo',
        'Redo',
        'Read only',
        'Alignment',
        'Merge cells',
      ].join(''));
    });
  });

  describe('Validation', () => {
    it('should not hide the merged cells after validating the table', async() => {
      const onAfterValidate = jasmine.createSpy('onAfterValidate');
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: [
          { row: 5, col: 4, rowspan: 2, colspan: 2 },
          { row: 1, col: 1, rowspan: 2, colspan: 2 },
        ],
        validator(query, callback) {
          callback(true);
        },
        afterValidate: onAfterValidate
      });

      let firstCollection = hot.getCell(5, 4);
      let secondCollection = hot.getCell(1, 1);

      expect(firstCollection.style.display.indexOf('none')).toEqual(-1);
      expect(secondCollection.style.display.indexOf('none')).toEqual(-1);

      hot.validateCells();

      await sleep(300);

      expect(onAfterValidate).toHaveBeenCalled();

      firstCollection = hot.getCell(5, 4);
      secondCollection = hot.getCell(1, 1);

      expect(firstCollection.style.display.indexOf('none')).toEqual(-1);
      expect(secondCollection.style.display.indexOf('none')).toEqual(-1);
    });
  });

  describe('Entire row/column selection', () => {
    it('should be possible to select a single entire column, when there\'s a merged cell in it', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: [
          { row: 5, col: 4, rowspan: 2, colspan: 5 }
        ]
      });

      hot.selectColumns(5);

      expect(hot.getSelectedLast()).toEqual([0, 5, 9, 5]);

      // it should work only for selecting the entire column
      hot.selectCell(4, 5, 7, 5);

      expect(hot.getSelectedLast()).toEqual([4, 4, 7, 8]);
    });

    it('should be possible to select a single entire row, when there\'s a merged cell in it', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: [
          { row: 5, col: 4, rowspan: 5, colspan: 2 }
        ]
      });

      hot.selectRows(5);

      expect(hot.getSelectedLast()).toEqual([5, 0, 5, 9]);

      // it should work only for selecting the entire row
      hot.selectCell(6, 3, 6, 7);

      expect(hot.getSelectedLast()).toEqual([5, 3, 9, 7]);
    });
  });

  describe('Undo/Redo', () => {
    it('should not be possible to remove initially declared merged cells by calling the \'Undo\' action.', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: [
          { row: 5, col: 4, rowspan: 2, colspan: 5 },
          { row: 1, col: 1, rowspan: 2, colspan: 2 },
        ]
      });

      hot.undo();

      expect(hot.getPlugin('mergeCells').mergedCellsCollection.mergedCells.length).toEqual(2);
    });

    it('should be possible undo the merging process by calling the \'Undo\' action.', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: true
      });

      const plugin = hot.getPlugin('mergeCells');

      plugin.merge(0, 0, 3, 3);
      hot.selectCell(4, 4, 7, 7);
      plugin.mergeSelection();

      expect(plugin.mergedCellsCollection.mergedCells.length).toEqual(2);
      hot.undo();
      expect(plugin.mergedCellsCollection.mergedCells.length).toEqual(1);
      hot.undo();
      expect(plugin.mergedCellsCollection.mergedCells.length).toEqual(0);
    });

    it('should be possible redo the merging process by calling the \'Redo\' action.', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        mergeCells: true
      });

      const plugin = hot.getPlugin('mergeCells');

      plugin.merge(0, 0, 3, 3);
      hot.selectCell(4, 4, 7, 7);
      plugin.mergeSelection();

      hot.undo();
      hot.undo();

      hot.redo();
      expect(plugin.mergedCellsCollection.mergedCells.length).toEqual(1);
      hot.redo();
      expect(plugin.mergedCellsCollection.mergedCells.length).toEqual(2);
    });
  });

  describe('cooperation with the `Autofill` plugin', () => {
    it('should add new merged areas when dragged the merged cell', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetObjectData(5, 5),
        mergeCells: [
          { row: 0, col: 0, rowspan: 2, colspan: 2 }
        ],
        fillHandle: true
      });

      selectCell(0, 0);

      // Dragging merged cell one level down.
      spec().$container.find('.wtBorder.current.corner').simulate('mousedown');
      spec().$container.find('tr:eq(2) td:eq(0)').simulate('mouseover');
      spec().$container.find('tr:eq(2) td:eq(0)').simulate('mouseup');

      // First merged cell.
      expect(spec().$container.find('tr:eq(0) td:eq(0)')[0].offsetWidth).toBe(100);
      expect(spec().$container.find('tr:eq(0) td:eq(0)')[0].offsetHeight).toBe(47);
      expect(getCell(0, 1).innerText).toBe('A1');
      expect(getDataAtCell(0, 0)).toBe('A1');
      // Already populated merged cell.
      expect(spec().$container.find('tr:eq(2) td:eq(0)')[0].offsetWidth).toBe(100);
      expect(spec().$container.find('tr:eq(2) td:eq(0)')[0].offsetHeight).toBe(46);
      expect(getCell(2, 1).innerText).toBe('A1');
      expect(getDataAtCell(2, 0)).toBe('A1');

      selectCell(0, 0);

      // Dragging merged cell one level right.
      spec().$container.find('.wtBorder.current.corner').simulate('mousedown');
      spec().$container.find('tr:eq(0) td:eq(2)').simulate('mouseover');
      spec().$container.find('tr:eq(0) td:eq(2)').simulate('mouseup');

      // First merged cell.
      expect(spec().$container.find('tr:eq(0) td:eq(0)')[0].offsetWidth).toBe(100);
      expect(spec().$container.find('tr:eq(0) td:eq(0)')[0].offsetHeight).toBe(47);
      expect(getCell(0, 1).innerText).toBe('A1');
      expect(getDataAtCell(0, 0)).toBe('A1');
      // Previously populated merged cell.
      expect(spec().$container.find('tr:eq(2) td:eq(0)')[0].offsetWidth).toBe(100);
      expect(spec().$container.find('tr:eq(2) td:eq(0)')[0].offsetHeight).toBe(46);
      expect(getCell(2, 1).innerText).toBe('A1');
      expect(getDataAtCell(2, 0)).toBe('A1');
      // Already populated merged cell.
      expect(spec().$container.find('tr:eq(0) td:eq(2)')[0].offsetWidth).toBe(100);
      expect(spec().$container.find('tr:eq(0) td:eq(2)')[0].offsetHeight).toBe(47);
      expect(getCell(0, 3).innerText).toBe('A1');
      expect(getDataAtCell(0, 2)).toBe('A1');

      expect($(getHtCore())[0].offsetWidth).toBe(5 * 50);
      expect($(getHtCore())[0].offsetHeight).toBe(24 + (4 * 23)); // First row is 1px higher than others.
    });
  });

  describe('Hooks', () => {
    it('should trigger the `beforeOnCellMouseDown` hook with proper coords', () => {
      let rowOnCellMouseDown;
      let columnOnCellMouseDown;
      let coordsOnCellMouseDown;

      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        mergeCells: [{ row: 0, col: 0, rowspan: 2, colspan: 4 }],
        beforeOnCellMouseDown(_, coords) {
          coordsOnCellMouseDown = coords;
          rowOnCellMouseDown = coords.row;
          columnOnCellMouseDown = coords.col;
        }
      });

      // Click on the first visible cell (merged area).
      simulateClick(spec().$container.find('tr:eq(1) td:eq(0)'));

      expect(rowOnCellMouseDown).toEqual(0);
      expect(columnOnCellMouseDown).toEqual(0);
      expect(coordsOnCellMouseDown).toEqual(jasmine.objectContaining({ row: 0, col: 0 }));
    });

    it('should trigger the `afterOnCellMouseDown` hook with proper coords', () => {
      let rowOnCellMouseDown;
      let columnOnCellMouseDown;
      let coordsOnCellMouseDown;

      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        mergeCells: [{ row: 0, col: 0, rowspan: 2, colspan: 4 }],
        afterOnCellMouseDown(_, coords) {
          coordsOnCellMouseDown = coords;
          rowOnCellMouseDown = coords.row;
          columnOnCellMouseDown = coords.col;
        }
      });

      // Click on the first visible cell (merged area).
      simulateClick(spec().$container.find('tr:eq(1) td:eq(0)'));

      expect(rowOnCellMouseDown).toEqual(0);
      expect(columnOnCellMouseDown).toEqual(0);
      expect(coordsOnCellMouseDown).toEqual(jasmine.objectContaining({ row: 0, col: 0 }));
    });
  });

  it('should set/unset "copyable" cell meta attribute after performing merge/unmerge', () => {
    handsontable({
      data: Handsontable.helper.createSpreadsheetData(10, 10),
      mergeCells: true
    });

    selectCell(2, 2, 4, 4);
    keyDownUp(['control', 'm']);

    expect(getCellMeta(2, 2).copyable).toBe(true);
    expect(getCellMeta(2, 3).copyable).toBe(false);
    expect(getCellMeta(2, 4).copyable).toBe(false);
    expect(getCellMeta(3, 3).copyable).toBe(false);
    expect(getCellMeta(3, 4).copyable).toBe(false);
    expect(getCellMeta(4, 4).copyable).toBe(false);

    keyDownUp(['control', 'm']);

    expect(getCellMeta(2, 2).copyable).toBe(true);
    expect(getCellMeta(2, 3).copyable).toBe(true);
    expect(getCellMeta(2, 4).copyable).toBe(true);
    expect(getCellMeta(3, 3).copyable).toBe(true);
    expect(getCellMeta(3, 4).copyable).toBe(true);
    expect(getCellMeta(4, 4).copyable).toBe(true);

    keyDownUp(['control', 'm']);

    expect(getCellMeta(2, 2).copyable).toBe(true);
    expect(getCellMeta(2, 3).copyable).toBe(false);
    expect(getCellMeta(2, 4).copyable).toBe(false);
    expect(getCellMeta(3, 3).copyable).toBe(false);
    expect(getCellMeta(3, 4).copyable).toBe(false);
    expect(getCellMeta(4, 4).copyable).toBe(false);
  });
});
