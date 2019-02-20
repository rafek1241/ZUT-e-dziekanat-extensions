// ==UserScript==
// @name         E-dziekanat ZUT extensions
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Average sums etc.
// @author       github.com/rafek1241
// @match        https://edziekanat.zut.edu.pl/*
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require      https://raw.githubusercontent.com/lodash/lodash/4.17.11/dist/lodash.js
// @grant        none
// @run-at document-end
// ==/UserScript==

(function() {
  "use strict";

  var $ = window.jQuery;
  $("#logging_in_panel > span").text("e-Dziekanat edited by rafek1241");

  //add column header with point * mark
  var table = $("table.gridPadding");
  table.find(".gridDaneHead").append("<td>pkt * ocena</td>");

  var removeWhiteDataRows = function() {
    table.find(".gridDane").each(function() {
      if ($(this).css("background-color") == "rgba(0, 0, 0, 0)") {
        $(this).remove();
      }
    });
  };

  // createButtonInTheMarksPage(
  //   "Remove white data rows",
  //   removeWhiteDataRows,
  //   $(".page_title")
  // );

  var result = initializeTableData(table);

  var ectsSum = _.sum(result["ectsArray"]);
  var pointMarkSum = _.sum(result["pointMarks"]);

  recreateSummaryRows(ectsSum, pointMarkSum);

  function recreateSummaryRows(ectsSum, pointMarkSum, ectsRowEl, gridSumEl){
    if(ectsRowEl == null)
    var ectsRow = $(
      '<tr class="gridSum"><td colspan="10">Suma ECTS, pkt*ocen</td><td>' +
        ectsSum +
        "</td><td>" +
        pointMarkSum +
        "</td></tr>"
    );
  
    if(ectsRowEl == null)
    var gridSumRow = $(
      '<tr class="gridSum"><td colspan="11"><strong>Suma ocena*pkt/suma ects = średnia:</strong></td><td><strong>' +
        pointMarkSum / ectsSum +
        "</strong></td></tr>"
    );

  
    console.log(ectsRow);
    console.log(gridSumRow);
  
    table
      .find("tbody")
      .append(ectsRow)
      .append(gridSumRow);
  
  } 

  function createButtonInTheMarksPage(caption, event, el) {
    var a = $(
      '<div class="przyciskM" style="    color: #fff!important;    background-color: #125bd0;    border-color: #0e46a1;    display: inline-block;    margin: 0 5px;    font-weight: 400;    text-align: center;    vertical-align: middle;    cursor: pointer;    background-image: none;    border: 1px solid transparent;    white-space: nowrap;    font-size: 14px;    line-height: 1.428571429;    border-radius: 4px;    padding: 6px 12px;    color: #5e6d84;    border-color: #d0d6de;    -webkit-user-select: none;    -moz-user-select: none;    -ms-user-select: none;    -o-user-select: none;    user-select: none;">' +
        caption +
        "</div>"
    );
    el.append(a);
    a.click(event);
  }

  // create point * mark column
  function initializeTableData(table) {
    var ectsArr = [];
    var pointMarkArr = [];

    removeWhiteDataRows();

    table.find(".gridDane").each(function() {
      //find and remove all dates & not numbers from marks.
      var dateRegex = /<br>(<span class=\"ocena\">)*\d{2}.\d{2}.\d{2}(<\/span>)*/g;
      var notNumberRegex = /<span class=\"ocena\">zal<\/span>/g;

      var dataRow = $(this)
        .html()
        .replace(dateRegex, "")
        .replace(notNumberRegex, "0");

      $(this).html(dataRow);

      //fetch latest mark.
      var rowCols = $(this).find("td");
      var mark = 0;

      for (var index = 0; index < 3; index++) {
        mark = compareMarkAndTakeIfNumber(mark, rowCols[5 + index]);
      }

      //fetch ECTS points.
      var ects = parseInt(
        $(rowCols)
          .last()
          .text()
          .trim()
      );

      var ectsMarkMult = ects * mark;

      ectsArr.push(ects);
      pointMarkArr.push(ectsMarkMult);

      $(this).append("<td>" + ectsMarkMult + "</td>");
    });

    return {
      ectsArray: ectsArr,
      pointMarks: pointMarkArr
    };
  }

  function compareMarkAndTakeIfNumber(mark, element) {
    var elText = $(element)
      .text()
      .trim()
      .replace(",", ".");
    if (elText.length > 0) {
      var elNum = parseFloat(elText);
      if (!isNaN(elNum)) {
        return elNum;
      }
    }
    return mark;
  }
})();
