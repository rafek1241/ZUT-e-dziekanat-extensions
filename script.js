// ==UserScript==
// @name         E-dziekanat ZUT extensions
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Average sums etc.
// @author       github.com/rafek1241
// @match        https://edziekanat.zut.edu.pl/*
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @grant        none
// @run-at document-end
// ==/UserScript==

(function() {
  "use strict";
  var $ = window.jQuery;
  $("#logging_in_panel > span").text("e-Dziekanat edited by rafek1241");

  //add column with point * mark
  var ectsSum = 0,
    pointMarkSum = 0;
  var table = $("table.gridPadding");
  var headers = table.find(".gridDaneHead");
  headers.append("<td>pkt * ocena</td>");

  table.find(".gridDane").each(function() {
    if ($(this).css("background-color") == "rgba(0, 0, 0, 0)") {
      $(this).remove();
    }

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

    var rowSum = ects * mark;

    ectsSum += ects;
    pointMarkSum += rowSum;

    $(this).append("<td>" + rowSum + "</td>");
  });

  table
    .find("tbody")
    .append(
      '<tr class="gridSum"><td colspan="10">Suma ECTS, pkt*ocen</td><td>' +
        ectsSum +
        "</td><td>" +
        pointMarkSum +
        "</td></tr>"
    )
    .append(
      '<tr class="gridSum"><td colspan="11"><strong>Suma ocena*pkt/suma ects = średnia:</strong></td><td><strong>' +
        pointMarkSum / ectsSum +
        "</strong></td></tr>"
    );

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
