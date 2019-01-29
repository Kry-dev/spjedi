var reportOfUnion = (function (self) {
    var _default = {};
    _default.pieChart = {};
    _default.pieChart.options = {
        responsive: true
    };

    self.drawTimingChart = function (domElement) {
        var initialData = self.timingChart_getDataAndDraw()
        CHARTS.timingPieChart.draw(domElement, initialData);
    }
    
    self.drawRiskChart = function (domElement){
        var initialData = self.getInitialDataRisk()
        CHARTS.riskPieChart.draw(domElement, initialData);
    }

    self.createProjectFilter = function (domElement) {
        var data = self.getInitialDataProjects();
        FILTERS.projectFilter.create(domElement, data);
    }

    self.createProjectCategoryFilter = function (domElement) {
        var data = self.getInitialDataProjectCategories();
        FILTERS.projectCategoryFilter.create(domElement, data);
    }

    self.generateColorsForPieChart = function() {
        r = Math.floor(Math.random() * 200);
        g = Math.floor(Math.random() * 200);
        b = Math.floor(Math.random() * 200);
        v = Math.floor(Math.random() * 500);
        c = 'rgba(' + r + ', ' + g + ', ' + b + ', 0.2' +  ')';
        h = 'rgba(' + r + ', ' + g + ', ' + b + ', 0.4' + ')';
        return { color: c, hoverColor: h };
    }
    return self;
}(reportOfUnion || {}));

var CHARTS = (function (self) {
    self.default = {};
    self.default.pieChart = {};

    self.generateLabelsWithData = function (chart, suffixForText) {
        var data = chart.data;
        if (data.labels.length && data.datasets.length) {
            return data.labels.map(function (label, i) {
                if (label == "")
                    label = "(empty)";
                var meta = chart.getDatasetMeta(0);
                var ds = data.datasets[0];
                var arc = meta.data[i];
                var value = ds.data[i];
                var custom = arc && arc.custom || {};
                var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
                var arcOpts = chart.options.elements.arc;
                var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
                var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
                var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

                var text = label + " - " + value;
                if (suffixForText)
                    text += suffixForText;
                return {
                    text: text,
                    fillStyle: fill,
                    strokeStyle: stroke,
                    lineWidth: bw,
                    hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                    index: i
                };
            });
        } else {
            return [];
        }
    }

    self.generateLabelsWithPercents = function (chart) {
        var data = chart.data;
        if (data.labels.length && data.datasets.length) {
            var total = new jinqJs().from(data.datasets[0].data).sum().select();

            return data.labels.map(function (label, i) {
                if (label == "")
                    label = "(empty)";
                var meta = chart.getDatasetMeta(0);
                var ds = data.datasets[0];
                var arc = meta.data[i];

                var value = Math.round(ds.data[i] / total * 100);

                var custom = arc && arc.custom || {};
                var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
                var arcOpts = chart.options.elements.arc;
                var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
                var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
                var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

                var text = label + " - " + value + "%";
                
                return {
                    text: text,
                    fillStyle: fill,
                    strokeStyle: stroke,
                    lineWidth: bw,
                    hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                    index: i
                };
            });
        } else {
            return [];
        }
    }

    self.generateTooltipWithPercentage = function (tooltipItem, data) {
        var dataset = data.datasets[tooltipItem.datasetIndex];
        var total = dataset.data.reduce(function (previousValue, currentValue, currentIndex, array) {
            return previousValue + currentValue;
        });
        var currentValue = dataset.data[tooltipItem.index];
        var precentage = Math.floor(((currentValue / total) * 100) + 0.5);
        var label = data.labels[tooltipItem.index];
        if (label == "")
            label = "(empty)";
        return label + ": " + precentage + "%";
    }

    self.generateTooltipWithNumbers = function (tooltipItem, data) {
        var dataset = data.datasets[tooltipItem.datasetIndex];
        var currentValue = dataset.data[tooltipItem.index];
        var label = data.labels[tooltipItem.index];
        if (label == "")
            label = "(empty)";
        return label + ": " + currentValue;
    }

    self.default.pieChart.options = {
        responsive: true,       
        legend: {
            labels: {
                generateLabels: self.generateLabelsWithData
            }
        },
        tooltips : {
            callbacks: {
                //Show percentage
                label: self.generateTooltipWithPercentage
            }
        },
    };

    self.colors = {};
    self.colors.getTimingColors = function (timing) {
        switch (timing.toLowerCase()) {
            case 'on time':
                return { color: "rgba(0, 128, 0, 0.5)", hoverColor: "rgba(0, 128, 0, 0.7)" };
                break;
            case 'at risk':
                return { color: "rgba(255, 240, 0, 0.5)", hoverColor: "rgba(255, 240, 0, 0.7)" };
                break;
            case 'late':
                return { color: "rgba(255, 0, 0, 0.5)", hoverColor: "rgba(255, 0, 0, 0.7)" };
                break;
            default:
                return { color: "rgba(204, 204, 204, 0.5)", hoverColor: "rgba(204, 204, 204, 0.7)" };
        }
    }
    self.colors.getRiskColors = function (risk) {
        switch (risk.toString().toLowerCase()) {
            case 'high':
                return { color: "rgba(255, 0, 0, 0.5)", hoverColor: "rgba(255, 0, 0, 0.7)" };
                break;
            case 'medium':
                return { color: "rgba(255, 240, 0, 0.5)", hoverColor: "rgba(255, 240, 0, 0.7)" };
                break;
            case 'low':
                return { color: "rgba(0, 128, 0, 0.5)", hoverColor: "rgba(0, 128, 0, 0.7)" };
                break;
            default:
                return { color: "rgba(204, 204, 204, 0.5)", hoverColor: "rgba(204, 204, 204, 0.7)" };
        }
    }
    self.colors.getCalculatedMarginColors = function (margin) {
        switch (margin.toString().toLowerCase()) {
            case 'low':
                return { color: "rgba(255, 0, 0, 0.5)", hoverColor: "rgba(255, 0, 0, 0.7)" }; //red
                break;
            case 'medium':
                return { color: "rgba(255, 240, 0, 0.5)", hoverColor: "rgba(255, 240, 0, 0.7)" }; //yellow
                break;
            case 'high':
                return { color: "rgba(0, 128, 0, 0.5)", hoverColor: "rgba(0, 128, 0, 0.7)" }; // green
                break;
            default:
                return { color: "rgba(204, 204, 204, 0.5)", hoverColor: "rgba(204, 204, 204, 0.7)" };
        }
    }

    self.colors.getProjectCostsColors = function (costs) {
        switch (costs.toString()) {
            case 'adjSubMaterialCost':
                return { color: "rgba(153, 0, 153, 0.5)", hoverColor: "rgba(153, 0, 153, 0.7)" };
                break;
            case 'adjSubLabourCost':
                return { color: "rgba(16, 150, 24, 0.5)", hoverColor: "rgba(16, 150, 24, 0.7)" };
                break;
            case 'adjSubFixOverhead':
                return { color: "rgba(255, 153, 0, 0.5)", hoverColor: "rgba(255, 153, 0, 0.7)" };
                break;
            case 'adjSubVariableOverhead':
                return { color: "rgba(220, 57, 18, 0.5)", hoverColor: "rgba220, 57, 18, 0.7)" };
                break;
            default:
                return { color: "rgba(204, 204, 204, 0.5)", hoverColor: "rgba(204, 204, 204, 0.7)" };
        }
    }

    return self;
}(CHARTS || {}));

CHARTS.timingPieChart = (function () {
    var self = {};
    self.dataLoader = {};
    self.dataLoader.getTimingData = function (initialData) {
        //var initialData = self.getInitialDataTiming();
        var transformedData = new jinqJs()
            .from(initialData)
            .groupBy('projectTiming')
            .count('count')
            .select();
        //transformedData = [{count, projectTiming}, {count, projectTiming}]
        var data = {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: []
            }]
        };
        transformedData.forEach(function (item) {
            data.labels.push(item.projectTiming);
            data.datasets[0].data.push(item.count);
            var colors = CHARTS.colors.getTimingColors(item.projectTiming);
            data.datasets[0].backgroundColor.push(colors.color);
            data.datasets[0].hoverBackgroundColor.push(colors.hoverColor);
        });
        return data;       
    }

    self.draw = function (domElement, initialData) {
        var transformedData = self.dataLoader.getTimingData(initialData);
        var options = $.extend({}, 
            CHARTS.default.pieChart.options,
            {
                tooltips: {
                    callbacks: {
                        //Show numbers
                        label: CHARTS.generateTooltipWithNumbers
                    }
                }
            }
        );        

        var chart = new Chart(domElement, {
            type: 'pie',            
            data: transformedData,
            options: options            
        });
        chart.generateLegend();
        LOADINGSPINNER.notifyEndOfWork(self);
        return chart;
    }
    return self;
}());

CHARTS.riskPieChart = (function () {
    var self = {};
    self.dataLoader = {};
    self.dataLoader.getRiskData = function (initialData) {
        //for each item add function that determines level of overall risk score
        initialData.forEach(function(item){
            if (item.overallRiskScore <= 33)
                item.overallRiskScoreLevel = 'Low';
            else if (item.overallRiskScore > 33 && item.overallRiskScore <= 64)
                item.overallRiskScoreLevel = 'Medium';
            else if (item.overallRiskScore > 64)
                item.overallRiskScoreLevel = 'High';
        });

        var transformedData = new jinqJs()
        .from(initialData)
        .groupBy('overallRiskScoreLevel')
        .count('count')
        .select();
        //transformedData = [{count, overallRiskScoreLevel}, {count, overallRiskScoreLevel}]

        var data = {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: []
            }]
        };
        transformedData.forEach(function (item) {
            data.labels.push(item.overallRiskScoreLevel);
            data.datasets[0].data.push(item.count);
            var colors = CHARTS.colors.getRiskColors(item.overallRiskScoreLevel);
            data.datasets[0].backgroundColor.push(colors.color);
            data.datasets[0].hoverBackgroundColor.push(colors.hoverColor);
        });
        return data;
    }

    self.draw = function (domElement, initialData) {
        var transformedData = self.dataLoader.getRiskData(initialData);
        var options = $.extend({},
            CHARTS.default.pieChart.options,
            {
                tooltips: {
                    callbacks: {
                        //Show numbers
                        label: CHARTS.generateTooltipWithNumbers
                    }
                }
            }
        );

        var chart = new Chart(domElement, {
            type: 'pie',            
            data: transformedData,
            options: options
        });
        LOADINGSPINNER.notifyEndOfWork(self);
        return chart;
    }
    return self;
}());

CHARTS.actionsGrid = (function () {
    var self = {};
    var propertiesArray = ['Discovery', 'CV', 'DV', 'PV'];
    self.dataLoader = {};
    self.dataLoader.getData = function (initialData) { //{ tollgateCategory: 'CV', status: 'In-Progress' },
        var transformData = new jinqJs()
            .from(initialData)
            .groupBy('status', 'tollgateCategory')
            .count('count')
            .select(); //[{status: 'In-Progress', tollgateCategory: 'CV', count: 2}]
        var data = [];
        transformData.forEach(function (item) {
            var fromData = new jinqJs()
                .from(data);
            var rowWithStatus = fromData.where('status = ' + item.status)
                .select('CV', 'DV', 'PV', 'Discovery', 'status');          
            if (typeof (rowWithStatus) === "undefined" || rowWithStatus.length == 0) {
                rowWithStatus[0] = { status: item.status };
                rowWithStatus[0][item.tollgateCategory] = item.count;
                data.push(rowWithStatus[0]);
            } else {
                fromData.update(function (coll, index) {
                    coll[index][item.tollgateCategory] = item.count;
                })
                .at('status = ' + item.status);
            }            
        });

        //'data' items may not to contain all CV, DV, PV and Discovery properties
        var prop = propertiesArray;
        data.forEach(function (item) {
            prop.forEach(function(p){
                if (!item.hasOwnProperty(p))
                    item[p] = 0;
            });            
        });

        return data;
    }

    self.draw = function (domElement, initialData) {
        var data = self.dataLoader.getData(initialData);
        
        var fields = [
            { name: "status", title: "Status", type: "text", headercss: "leftAlign" }
        ];
        propertiesArray.forEach(function (item) {
            fields.push({ name: item, type: "number", align: "right", headercss: "rightAlign" });
        });

        domElement.jsGrid({
            width: '100%',
            pageLoading: true,
            selecting: true,
            autoload: true,
            fields: fields,
            data: data
        });
        LOADINGSPINNER.notifyEndOfWork(self);
    }
    return self;
}());

CHARTS.projectGanttChart = (function () {
    var self = {};
    var _domElement; //must be initialized after page loaded
    var chart;
    self.dataLoader = {
        getData: function (initialData) {
            if (typeof(initialData) === 'undefined' || initialData == null)
                return null;

            var data = getDataTableHeader();

            var rows = [];
            //discovery
            if (initialData.discoveryStartDate != null && initialData.discoveryEndDate != null)
                rows.push([initialData.id + 'discovery', 'Discovery',
                    initialData.discoveryStartDate, initialData.discoveryEndDate, null, 0, null]);
            //prospect
            if (initialData.prospectStartDate != null && initialData.prospectEndDate != null)
                rows.push([initialData.id + 'prospect', 'Prospect',
                    initialData.prospectStartDate, initialData.prospectEndDate, null, 0, null]);
            //cv
            if (initialData.cvStartDate != null && initialData.cvEndDate != null)
                rows.push([initialData.id + 'cv', 'CV',
                    initialData.cvStartDate, initialData.cvEndDate, null, 0, null]);
            //dv
            if (initialData.dvStartDate != null && initialData.dvEndDate != null)
                rows.push([initialData.id + 'dv', 'DV',
                    initialData.dvStartDate, initialData.dvEndDate, null, 0, null]);
            //pv
            if (initialData.pvStartDate != null && initialData.pvEndDate != null)
                rows.push([initialData.id + 'pv', 'PV',
                    initialData.pvStartDate, initialData.pvEndDate, null, 0, null]);

            data.addRows(rows);
            return data;
        },
        getDataByProjectAsync: function (projectId) {
            return null;
        }
    };

    self.draw = function (domElement, initialData, enableTodayLine) {
        if (typeof(domElement) !== 'undefined' && domElement != null)
            _domElement = domElement;
                
        google.charts.setOnLoadCallback(function () {
            if ((typeof (initialData) === 'undefined' || initialData == null) && typeof (chart) !== 'undefined') {
                //chart.clearChart();
                _domElement.html('');
                return;
            }

            var data = self.dataLoader.getData(initialData);            
            var options = {
                height: 300
            };
            if (typeof (_domElement) !== 'undefined') {
                //if (typeof(chart) === 'undefined' )
                    chart = new google.visualization.Gantt(_domElement[0]);
                    if (typeof (data) !== 'undefined' && data != null) {
                        if (enableTodayLine) {
                            data.addRows([getTodayData()]);
                            google.visualization.events.addOneTimeListener(chart, 'ready', function () { getLastGanttRow(chart, data); });
                        }
                        chart.draw(data, options);
                    }
                //else
                //    chart.clearChart();
            }
            LOADINGSPINNER.notifyEndOfWork(self);
        });        
    }

    var getTodayData = function () {
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        var tomorrow = new Date();
        tomorrow.setHours(0);
        tomorrow.setMinutes(0);
        tomorrow.setSeconds(0);
        tomorrow.setDate(today.getDate() + 1);
        return ['today_discovery', 'Today',
               today, tomorrow, null, 0, null];
    }

    var getDataTableHeader = function () {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Task ID');
        data.addColumn('string', 'Task Name');
        data.addColumn('date', 'Start Date');
        data.addColumn('date', 'End Date');
        data.addColumn('number', 'Duration');
        data.addColumn('number', 'Percent Complete');
        data.addColumn('string', 'Dependencies');
        return data;
    }

    function getLastGanttRow(chart, data) {       
        var todayText = $('#ganttChart g:eq(7) text:contains("Today")');
        var nextTexts = todayText.nextAll('text');
        var todayIndex = todayText.index();
        
        var row = $('#ganttChart g:eq(1) rect:eq("' + todayIndex + '")');
        var rowHeight = row.attr('height');
        var nextRows = row.nextAll('rect');

        var todayRect = $('#ganttChart g:eq(5) rect:eq("' + todayIndex + '")');
        var nextRects = todayRect.nextAll('rect');

        nextRows.each(function (index, value) {
            var newY = $(value).attr('y') - rowHeight;
            $(value).attr('y', newY);
        });
        nextTexts.each(function (index, value) {
            var newY = $(value).attr('y') - rowHeight;
            $(value).attr('y', newY);
        });
        nextRects.each(function (index, value) {
            var newY = $(value).attr('y') - rowHeight;
            $(value).attr('y', newY);
        });
       
        todayRect.remove();
        todayText.remove();
        row.remove();

        var dateTexts = $('#ganttChart g:eq(1) text');
        dateTexts.each(function (index, value) {
            var newY = $(value).attr('y') - rowHeight;
            $(value).attr('y', newY);
        });
        
        
        var x = todayRect.attr('x');
        var y = todayRect.attr('y');
        var width = todayRect.attr('width');
        var svgHeight = $('#ganttChart svg:first').attr('height');
        
        var rectRowsInTimeline = $('#ganttChart svg:first g:eq(1) rect[fill!="none"]');
        var todayDivHeight = 0;
        rectRowsInTimeline.each(function (index, value) {
            todayDivHeight += parseInt($(value).attr('height'));
        });

        data.removeRow(data.getNumberOfRows() - 1);
        //chart.clearChart();
        //chart.draw(data, { height: 350 });

        var todayDiv = $('<div></div>').width(width)
            //.height(svgHeight - 23 - rowHeight - 23)
            .height(todayDivHeight)
            .css('background-color', 'red')
            .css('position', 'absolute')
            .css('top', '0px')
            .css('left', x + 'px')
            .css('opacity', '0.1');
        $('#ganttChart svg:first').after(todayDiv);
        //todayRect.remove();
    }

    return self;
}());

CHARTS.tasksGrid = (function () {
    var self = {};
    var _domElement;
    self.dataLoader = {
        getData: function (initialData) {
            return initialData;
        }
    };

    self.bindToDOMElement = function (domElement) {
        if (typeof (domElement) !== 'undefined' && domElement != null)
            _domElement = domElement;
    }

    self.draw = function (domElement, initialData) {
        if (typeof (domElement) !== 'undefined' && domElement != null)
            _domElement = domElement;
        var data = self.dataLoader.getData(initialData);
        var fields = [
            {
                name: "taskName", title: 'Task', type: "text", headercss: "leftAlign", autosearch: true, filtering: true
                , itemTemplate: function (value, item) {
                    var link = $("<a>").attr("href", item.url).text(value).attr('target','_blank');
                    return $("<div>").append(link);
                }
            }
        ];        
        
        _domElement.jsGrid({
            width: '100%',
            height: '300px',            
            pageLoading: true,
            selecting: true,
            autoload: true,
            fields: fields,
            data: data
        });

        LOADINGSPINNER.notifyEndOfWork(self);
    }

    return self;
}());

CHARTS.riskGrid = (function () {
    var self = {};
    var _domElement;
    self.dataLoader = {
        getData: function (initialData) {
            return initialData;
        }
    };

    self.bindToDOMElement = function (domElement) {
        if (typeof (domElement) !== 'undefined' && domElement != null)
            _domElement = domElement;
    }

    self.draw = function (domElement, initialData) {
        if (typeof (domElement) !== 'undefined' && domElement != null)
            _domElement = domElement;
        var data = self.dataLoader.getData(initialData);
        var topRisks = getTopRisks(data);

        var fields = [
            {
                name: "riskName", title: 'Name', type: "text", headercss: "leftAlign", autosearch: true, filtering: true, width: 60
                , itemTemplate: function (value, item) {
                    var link = $("<a>").attr("href", item.url).text(value).attr('target','_blank');
                    return $("<div>").append(link);
                }
            },
            { name: 'overallRiskScore', title: "Score", headercss: "leftAlign" , type: 'text', width: 35},
            { name: "riskDescription", title: 'Description', type: "text", headercss: "leftAlign", autosearch: true, filtering: true },
            { name: "riskMitigation", title: 'Mitigation', type: "text", headercss: "leftAlign", autosearch: true, filtering: true }
        ];

        _domElement.jsGrid({
            width: '100%',
            height: '300px',
            pageLoading: true,
            selecting: true,
            autoload: true,
            fields: fields,
            data: topRisks
        });

        LOADINGSPINNER.notifyEndOfWork(self);
    }

    var getTopRisks = function (risks) {
        var count = 0;
        var topRisks = [];

        var orderedRisks = new jinqJs().from(risks).orderBy([{ field: 'overallRiskScore', sort: 'desc' }]).select();
        var currentRiskScore = 0;
        for (var i = 0; i < risks.length; ++i){
            var r = orderedRisks[i];
            if (r.overallRiskScore < currentRiskScore && count >= 5)
                break;
            currentRiskScore = r.overallRiskScore;
            topRisks.push(r);
            count++;
        }
        return topRisks;
    }
   return self;
}());

CHARTS.costBarChart = (function () {
    var self = {};
    self.dataLoader = {};
    self.dataLoader.getData = function (initialData) {
        var GROUP = 'group';
        initialData.forEach(function (item) {
            item[GROUP] = GROUP;
        });
        var transformedData = new jinqJs()
            .from(initialData)
            .groupBy(GROUP)
            .sum('capitalCosts', 'projectDevCost')
            .select('capitalCosts', 'projectDevCost');
        
        var data = {
            labels: ['Cost'],
            datasets: [
                {
                    label: 'Capital Costs',
                    data: [transformedData[0].capitalCosts]
                    , backgroundColor: ['rgba(0, 128, 0, 0.5)'],
                    hoverBackgroundColor: ['rgba(0, 128, 0, 0.7)']
                },
                {
                    label: 'Project Dev Cost',
                    data: [transformedData[0].projectDevCost]
                    , backgroundColor: ["rgba(255, 240, 0, 0.5)"],
                    hoverBackgroundColor: ["rgba(255, 240, 0, 0.7)"]
                }
            ]
        };
        
        return data;
    }

    self.draw = function (domElement, initialData) {
        var transformedData = self.dataLoader.getData(initialData);
        var options = {
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true
                }]
            },
            title : {
                display: true,
                text: 'Non-Recurring Costs',
                fontSize: 14
            }
        };        

        var chart = new Chart(domElement, {
            type: 'bar',
            data: transformedData,
            options: options
        });
        LOADINGSPINNER.notifyEndOfWork(self);
        return chart;
    }

    return self;
}());

CHARTS.costPieChart = (function () {
    var self = {};
    var margin1 = 5;
    var margin2 = 10;
    self.dataLoader = {};
    self.dataLoader.getCostData = function (initialData) {
        //for each item add function that determines level of calculated margin
        initialData.forEach(function (item) {
            var calculatedMargin = item.calculatedMargin * 100;
            if (calculatedMargin <= margin1) {
                item.calculatedMarginLevel = 'Low';
                //item.label = "< $10,000";
                item.label = "< 5%";
            }
            else if (calculatedMargin > margin1 && calculatedMargin <= margin2) {
                item.calculatedMarginLevel = 'Medium';
                //item.label = "< $50,000";
                item.label = "< 10%";
            }
            else if (calculatedMargin > margin2) {
                item.calculatedMarginLevel = 'High';
                //item.label = "> $50,000";
                item.label = "> 10%";
            }
        });

        var transformedData = new jinqJs()
        .from(initialData)
        .groupBy('calculatedMarginLevel')
        .count('count')
        .select();        

        transformedData.forEach(function (item) {
            switch (item.calculatedMarginLevel) {
                case "Low":
                    //item.label = "< $10,000";
                    item.label = "< 5%";
                    break;
                case "Medium":
                    //item.label = "< $50,000";
                    item.label = "< 10%";
                    break;
                case "High":
                    //item.label = "> $50,000";
                    item.label = "> 10%";
                    break;
            }
        });

        var data = {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: []
            }]
        };
        transformedData.forEach(function (item) {
            data.labels.push(item.label);
            //data.datasets[0].data.push( Math.round(item.count / initialData.length)*100);
            data.datasets[0].data.push(item.count);
            var colors = CHARTS.colors.getCalculatedMarginColors(item.calculatedMarginLevel);
            data.datasets[0].backgroundColor.push(colors.color);
            data.datasets[0].hoverBackgroundColor.push(colors.hoverColor);
        });
        return data;
    }

    self.draw = function (domElement, initialData) {
        var transformedData = self.dataLoader.getCostData(initialData);       

        //rewrite methid that generates labels
        //options.legend.labels.generateLabels = function (chart) { return CHARTS.generateLabelsWithData(chart, "%"); };
        //self.default.pieChart.options = {
        //    responsive: true,       
        //    legend: {
        //        labels: {
        //            generateLabels: generateLabelsWithData
        //        }
        //    },

        var options = $.extend({},
            CHARTS.default.pieChart.options,
            {
                legend: {
                    labels: {
                        generateLabels: CHARTS.generateLabelsWithData// generateLabelsWithPercents
                    }
                }, 
                tooltips: {
                    callbacks: {
                        //Show numbers
                        label: CHARTS.generateTooltipWithNumbers
                    }
                },
                title: {
                    display: true,
                    text: 'Recurring Costs',
                    fontSize: 14
                }
            }
        );

       /* var options1 = $.extend({}, options, {
            title: {
                display: true,
                text: 'Recurring Costs',
                fontSize: 14
            }
        });*/
        var chart = new Chart(domElement, {
            type: 'pie',
            data: transformedData,
            options: options
        });
        LOADINGSPINNER.notifyEndOfWork(self);
        return chart;
    }

    return self;
}());

CHARTS.costProjectPieChart = (function () {
    var self = {};
    var _domElement;
    var currentChart;

    var getTotal = function (initiaData) {
        return initiaData.adjSubMaterialCost
            + initiaData.adjSubLabourCost
            + initiaData.adjSubFixOverhead
            + initiaData.adjSubVariableOverhead;
    }

    self.dataLoader = {};
    self.dataLoader.getCostData = function (initialData) {               
        var properties = [
            { value: "adjSubMaterialCost", label: "Material $" },
            { value: "adjSubLabourCost", label: "Labor $" },
            { value: "adjSubFixOverhead", label: "Fixed $" },
            { value: "adjSubVariableOverhead", label: "Variable Overhead $" }
        ];
        if (!initialData)
            return null;

        var data = {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: []
            }]
        };
        
        properties.forEach(function (item) {
            data.labels.push(item.label);
            data.datasets[0].data.push(initialData[item.value]);
            var colors = CHARTS.colors.getProjectCostsColors(item.value);
            data.datasets[0].backgroundColor.push(colors.color);
            data.datasets[0].hoverBackgroundColor.push(colors.hoverColor);
        });
        
        return data;
    }

    self.draw = function (domElement, initialData) {
        if (typeof (domElement) !== "undefined" && domElement !== null)
            _domElement = domElement;

        if (typeof (currentChart) !== "undefined")
            currentChart.destroy();

        var transformedData = self.dataLoader.getCostData(initialData);
        if (!transformedData) {
            LOADINGSPINNER.notifyEndOfWork(self);
            return;
        }
            
        var total = getTotal(initialData).toFixed(4);
        var title = 'Recurring Costs';
        if (total && total > 0)
            title +=  ' \n(Total: ' + getTotal(initialData) + ')';
        var options = CHARTS.default.pieChart.options;        
        options.title = {
            display: false,
            text: title,
            fontSize: 14
        };

        $('#chartSubTitle-recurring-total').text(total);

        var chart = new Chart(_domElement, {
            type: 'pie',
            data: transformedData,
            options: options
        });
        currentChart = chart;
        LOADINGSPINNER.notifyEndOfWork(self);
        return chart;
    }

    return self;
}());

CHARTS.costProjectBarChart = (function () {
    var self = {};
    var _domElement;
    var currentChart;

    var getTotal = function (initiaData) {
        if (initiaData)
            return initiaData.capitalCosts
                + initiaData.projectDevCost;
        else
            return 0;
    }

    self.dataLoader = {};

    //change behavior of method getData
    self.dataLoader.getData = function (initialData) {        
        var data = {
            labels: ['Cost'],
            datasets: [
                {
                    label: 'Capital Costs',
                    data: initialData ? [initialData.capitalCosts] : 0,
                    backgroundColor: ['rgba(0, 128, 0, 0.5)'],
                    hoverBackgroundColor: ['rgba(0, 128, 0, 0.7)']
                },
                {
                    label: 'Project Dev Cost',
                    data: initialData ? [initialData.projectDevCost] : 0,
                    backgroundColor: ["rgba(255, 240, 0, 0.5)"],
                    hoverBackgroundColor: ["rgba(255, 240, 0, 0.7)"]
                }
            ]
        };

        return data;
    }

    self.draw = function (domElement, initialData) {
        if (typeof (domElement) !== "undefined" && domElement !== null)
            _domElement = domElement;

        if (typeof (currentChart) !== "undefined")
            currentChart.destroy();

        var transformedData = self.dataLoader.getData(initialData);
        if (!transformedData) {
            LOADINGSPINNER.notifyEndOfWork(self);
            return;
        }

        var options = {
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true
                }]
            },
            title: {
                display: false,
                text: 'Non-Recurring Costs',
                fontSize: 14
            }
        };


        var total = getTotal(initialData);
        $('#chartSubTitle-nonrecurring-total').text(total);

        var chart = new Chart(_domElement, {
            type: 'bar',
            data: transformedData,
            options: options
        });
        currentChart = chart;
        LOADINGSPINNER.notifyEndOfWork(self);
        return chart;
    }
    return self;
}());

CHARTS.projectMagnifyingLink = (function () {
    var self = {};
    var _domElement;

    self.draw = function () {

    }

    return self;
}());

var FILTERS = (function (self) {
    return self;
}(FILTERS || {}));

FILTERS.projectFilter = (function (self) {
    //var self = {};
    var _domElement;
    var _defaultValue = null;
    self.allData = [];
    var filterOptions = {
        onChange: function (element, checked) {
            if (checked) {
                var selectedProjectId = $(element).val();
                //updateGanttChart(selectedProjectId);
            }
        },
        //disableIfEmpty: true,
        onInitialized: function (select, container) {            
            var selectedProjectId = $('option:selected', select).val();
            PROJECT_CHART_VIEWMODEL.project(selectedProjectId);
            //updateGanttChart(selectedProjectId);
        }
    };

    self.dataLoader = {
        getData: function (initialData) { //{ projectName: 'Project 1', status: 'Proposed', id: 1, category: 'Category 1' }
            return initialData;
        },
        getDataByCategory: function (category) {
            return new jinqJs().from(self.allData)
                .where('category = ' + category)
                .select('projectName', 'id');
        }
    };

    self.create = function (domElement, initialData, category, defaultValue) {
        _domElement = domElement;
        _defaultValue = defaultValue;
        //self.dataLoader.loadAllData(); //cache all projects
        self.allData = DATAPROVIDER.allProjectData; // it must loaded before
        
        if (typeof (category) !== "undefined" && category != null) {
            var data = self.dataLoader.getDataByCategory(category);
            addOptions(_domElement, data);
            domElement.multiselect(filterOptions);
            
        }
                
        LOADINGSPINNER.notifyEndOfWork(self);
    }

    self.update = function (initialData, category) {
        var data = self.dataLoader.getDataByCategory(category);
        if (typeof (_domElement) !== 'undefined') {
            _domElement.html('');
            _domElement.multiselect('destroy');
            addOptions(_domElement, data);
            _domElement.multiselect(filterOptions);
            //_domElement.multiselect('rebuild');
            if (PROJECT_CHART_VIEWMODEL.defaultProject() == null && _defaultValue != null)
                PROJECT_CHART_VIEWMODEL.defaultProject(_defaultValue);
        }
    };

    self.setValue = function (projectId) {
        _domElement.multiselect('select', projectId)
                    .multiselect('refresh');
        PROJECT_CHART_VIEWMODEL.project(projectId);
    }

    var addOptions = function (selectElement, data) {
        data.forEach(function (item) {
            selectElement.append($("<option></option>")
                    .attr("value", item.id)
                    .text(item.projectName));
        });
    }

    var updateGanttChart = function (projectId) {
        reportOfUnion.projectGanttChart_getDataAndDraw(function (data) { CHARTS.projectGanttChart.draw(null, data) }, projectId);
        
    }
    return self;
}(FILTERS.projectFilter || {}));

FILTERS.projectCategoryFilter = (function () {
    var self = {};
    var _domElement;
    var _defaultCategory;
    self.selectedValue;
    self.dataLoader = {
        getData: function (initialData) { //{ category: "Category 1", id : 1 }
            var categories = new jinqJs()
            .from(initialData)
            .distinct('category')
            .select();
            return categories;
        }
    };

    self.create = function (domElement, initialData, defaultCategory) {
        _domElement = domElement;
        var data = self.dataLoader.getData(initialData);
        data.forEach(function (item) {
            domElement.append($("<option></option>")
                    .attr("value", item.category)
                    .text(item.category));
        });
        if (typeof (defaultCategory) !== "undefined") {
            _defaultCategory = defaultCategory;
            PROJECT_CHART_VIEWMODEL.category(defaultCategory);
        }
        domElement.multiselect({
            onChange: onChangeCategory,
            onInitialized: onCategoryInitialized
        });
        
        LOADINGSPINNER.notifyEndOfWork(self);
    }

    var onChangeCategory = function (element, selected) {
        //FILTERS.projectFilter.update(null, element[0].text);
    }
    var onCategoryInitialized = function (select, container) {
        //if (typeof (_defaultCategory) !== "undefined" && _defaultCategory != null) {
        //    PROJECT_CHART_VIEWMODEL.category(-_defaultCategory);
        //} else {
        //    var selectedCategory = $('option:selected', select).val();
        //    self.selectedValue = selectedCategory;
        //    PROJECT_CHART_VIEWMODEL.category(selectedCategory);
        //}
        //FILTERS.projectFilter.update(null,selectedCategory);
    }
    return self;
}());

var DATAPROVIDER = (function (self) {
    self.getCategoryByProject = function (projectId) {
        if (typeof (projectId) === "undefined")
            return null;
        var project = new jinqJs().from(self.allProjectData)
        .where('id = ' + projectId)
        .select();
        if (project.length > 0)
            return project[0].category;
        else return null;
    }
    return self;
}(DATAPROVIDER || {}));

var LOADINGSPINNER = (function () {
    var self = {};
    var created = false;
    var domElement;
    self.loadingSpiner;
    var waitingList = [];
    var contentToHideBeforeLoading;
    var opts = {
        lines: 11 // The number of lines to draw
        , length: 27 // The length of each line
        , width: 9 // The line thickness
        , radius: 29 // The radius of the inner circle
        , scale: 0.5 // Scales overall size of the spinner
        , corners: 0.9 // Corner roundness (0..1)
        , color: '#000' // #rgb or #rrggbb or array of colors
        , opacity: 0.4 // Opacity of the lines
        , rotate: 0 // The rotation offset
        , direction: 1 // 1: clockwise, -1: counterclockwise
        , speed: 1 // Rounds per second
        , trail: 60 // Afterglow percentage
        , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        , zIndex: 2e9 // The z-index (defaults to 2000000000)
        , className: 'spinner' // The CSS class to assign to the spinner
        , top: '50%' // Top position relative to parent
        , left: '50%' // Left position relative to parent
        , shadow: false // Whether to render a shadow
        , hwaccel: false // Whether to use hardware acceleration
        , position: 'absolute' // Element positioning
    };

    self.create = function (_domElement, _waitingList, _contentToHideBeforeLoading) {
        domElement = _domElement;
        contentToHideBeforeLoading = _contentToHideBeforeLoading;
        _waitingList.forEach(function(item){
            waitingList.push({object: item, finished: false});
        });
        var spinner;
        if (domElement) {
            spinner = new Spinner(opts).spin(domElement);            
        } else {
            $('<div class="whiteLayout"></div>').appendTo(contentToHideBeforeLoading);
            var div = $('<div class="loadingDiv"><div id="loadingLayout"></div><div id="loadingSpinner"></div></div>').appendTo('body');
            domElement = div;
            spinner = new Spinner(opts).spin(div.find('#loadingSpinner')[0]);
        }
        self.loadingSpiner = spinner;
        created = true;
    }

    self.stop = function () {
        if (domElement)
            domElement.remove();
        $('.whiteLayout').remove();
    }

    self.notifyEndOfWork = function (obj) {
        if (!created)
            return;
        var finishedWorkCount = 0;
        waitingList.forEach(function (item) {
            if (item.object == obj)
                item.finished = true;
        });
        waitingList.forEach(function (item) {
            if (item.finished == true)
                finishedWorkCount++;
        });
        if (waitingList.length == finishedWorkCount)
            self.stop();
    }

    return self;
}());

/* takes a string phrase and breaks it into separate phrases 
   no bigger than 'maxwidth', breaks are made at complete words.*/

function formatLabel(str, maxwidth) {
    var sections = [];
    var words = str.split(" ");
    var temp = "";

    words.forEach(function (item, index) {
        if (temp.length > 0) {
            var concat = temp + ' ' + item;

            if (concat.length > maxwidth) {
                sections.push(temp);
                temp = "";
            }
            else {
                if (index == (words.length - 1)) {
                    sections.push(concat);
                    return;
                }
                else {
                    temp = concat;
                    return;
                }
            }
        }

        if (index == (words.length - 1)) {
            sections.push(item);
            return;
        }

        if (item.length < maxwidth) {
            temp = item;
        }
        else {
            sections.push(item);
        }

    });

    return sections;
}


//-----------Query string plugin---------------------------------
/*!
    query-string
    Parse and stringify URL query strings
    https://github.com/sindresorhus/query-string
    by Sindre Sorhus
    MIT License
*/
(function () {
    'use strict';
    var queryString = {};

    queryString.parse = function (str) {
        if (typeof str !== 'string') {
            return {};
        }

        str = str.trim().replace(/^\?/, '');

        if (!str) {
            return {};
        }

        return str.trim().split('&').reduce(function (ret, param) {
            var parts = param.replace(/\+/g, ' ').split('=');
            var key = parts[0];
            var val = parts[1];

            key = decodeURIComponent(key);
            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            val = val === undefined ? null : decodeURIComponent(val);

            if (!ret.hasOwnProperty(key)) {
                ret[key] = val;
            } else if (Array.isArray(ret[key])) {
                ret[key].push(val);
            } else {
                ret[key] = [ret[key], val];
            }

            return ret;
        }, {});
    };

    queryString.stringify = function (obj) {
        return obj ? Object.keys(obj).map(function (key) {
            var val = obj[key];

            if (Array.isArray(val)) {
                return val.map(function (val2) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
                }).join('&');
            }

            return encodeURIComponent(key) + '=' + encodeURIComponent(val);
        }).join('&') : '';
    };

    queryString.push = function (key, new_value) {
        var params = queryString.parse(location.search);
        params[key] = new_value;
        var new_params_string = queryString.stringify(params)
        history.pushState({}, "", window.location.pathname + '?' + new_params_string);
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = queryString;
    } else {
        window.queryString = queryString;
    }
})();
//-------------------------------------------------------------------------




INITIAL_DATA_TIMING = [
    { projectTiming: 'On Time' },
    { projectTiming: 'At Risk' },
    { projectTiming: 'Late' },
    { projectTiming: 'On Time' },
    { projectTiming: 'At Risk' },
    { projectTiming: 'Late' }
];

INITIAL_DATA_RISKS = [
    { severity: 'Technical', risk: 1 },
    { severity: 'Technical', risk: 1 },
    { severity: 'Technical', risk: 2 },
    { severity: 'Technical', risk: 3 }
];

INITIAL_DATA_ACTIONS = [
    { tollgateCategory: 'CV', status: 'In-Progress' },
    { tollgateCategory: 'DV', status: 'Completed' },
    { tollgateCategory: 'PV', status: 'Completed' },
    { tollgateCategory: 'Discovery', status: 'In-Progress' },
    { tollgateCategory: 'CV', status: 'Unassigned' },
    { tollgateCategory: 'DV', status: 'In-Progress' },
    { tollgateCategory: 'CV', status: 'In-Progress' },
];

INITIAL_DATA_PROJECTS = [
    { projectName: 'Project 1', status: 'Proposed', id: 1 },
    { projectName: 'Project 2', status: 'In Progress', id: 2 },
    { projectName: 'Project 3', status: '111', id: 3 }
]

INITIAL_DATA_PROJECTCATEGORIES = [
    { categoryName: "Category 1", id: 1 },
    { categoryName: "Category 2", id: 2 },
    { categoryName: "Category 3", id: 3 }
]

var reportOfUnion = (function(self) {
    self.timingChart_getDataAndDraw = function(drawCallback) {
        function getListItems() {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Program Management');
            var caml = new SP.CamlQuery();
            caml.set_viewXml("<View><Query><Where><Or><Eq><FieldRef Name='Status' /><Value Type='Choice'>In Progress</Value></Eq><Eq><FieldRef Name='Status' /><Value Type='Choice'>Proposed</Value></Eq></Or></Where></Query></View>"); //SP.CamlQuery.createAllItemsQuery();
            var items = list.getItems(caml);
            clientContext.load(items);

            var o = { d: d, list: list, items: items };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        var p = getListItems();
        p.done(function(result) {
            var data = convertData(result.items);
            drawCallback(data);
        });
        p.fail(function(result) {
            var error = result;
        });

        function convertData(listItemCollection) {
            var data = [];
            if (!!listItemCollection) {
                var enumerator = listItemCollection.getEnumerator();
                while (enumerator.moveNext()) {
                    var listItem = enumerator.get_current();
                    var initialDataRow = {
                        projectTiming: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.programManagement.projectTiming))
                    };
                    data.push(initialDataRow);
                }
            }
            return data;
        }
    }

    self.riskChart_getDataAndDraw = function(drawCallback) {
        function getListItems() {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Risks');
            var caml = new SP.CamlQuery();
            caml.set_viewXml("<View>" +
                "<ViewFields>" +
                "<FieldRef Name='Risk_x0020_Status' />" +
                "<FieldRef Name='Project' />" +
                "<FieldRef Name='ProjectStatus' />" +
                "<FieldRef Name='Risk_x0020_Type' />" +
                "<FieldRef Name='Technical_x0020_Severity' />" +
                "<FieldRef Name='Overall_x0020_Risk_x0020_Score' />" +
                "<FieldRef Name='Risk_x0020_Mitigation' />" +
                "<FieldRef Name='Risk_x0020_Description' />" +
                "<FieldRef Name='Risk_x0020_Mitigation_x0020_Desc' />" +
                "</ViewFields>" +
                "<Joins>" +
                "<Join Type='LEFT' ListAlias='Program Management'>" +
                "<Eq>" +
                "<FieldRef Name='Project' RefType='ID' />" +
                "<FieldRef Name='ID' List='Program Management' />" +
                "</Eq>" +
                "</Join>" +
                "</Joins>" +
                "<ProjectedFields>" +
                "<Field ShowField='StatusText' Type='Lookup' Name='ProjectStatus' List='Program Management' />" +
                "</ProjectedFields>" +
                "<Query>" +
                "<Where>" +
                "<And>" +
                "<Eq>" +
                "<FieldRef Name='Risk_x0020_Status' />" +
                "<Value Type='Choice'>Active</Value>" +
                "</Eq>" +
                "<Neq>" +
                "<FieldRef Name='ProjectStatus' />" +
                "<Value Type='Text'>Cancelled</Value>" +
                "</Neq>" +
                "</And>" +
                "</Where>" +
                "</Query></View>");
            var items = list.getItems(caml);
            clientContext.load(items);

            var o = { d: d, list: list, items: items };
            clientContext.executeQueryAsync(
                Function.createDelegate(o,
                    function() {
                        this.d.resolve(this);
                    }),
                Function.createDelegate(o,
                    function() {
                        this.d.reject("something bad happened");
                    }));

            return d.promise();
        }

        var p = getListItems();
        p.done(function(result) {
            var data = convertData(result.items);
            drawCallback(data);
        });
        p.fail(function(result) {
            var error = result;
        });

        function convertData(listItemCollection) {
            var data = [];
            if (!!listItemCollection) {
                var enumerator = listItemCollection.getEnumerator();
                while (enumerator.moveNext()) {
                    var listItem = enumerator.get_current();
                    var initialDataRow = {
                        severity: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.risk.severity)),
                        risk: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.risk.risk)),
                        overallRiskScore: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.risk.overallRiskScore))
                    };
                    data.push(initialDataRow);
                }
            }
            return data;
        }
    }

    self.actionsGrid_getDataAndDraw = function(drawCallback) {
        function getListItems() {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Program Tollgates');
            var caml = new SP.CamlQuery();
            caml.set_viewXml("<View>" +
                "<ViewFields>" +
                "<FieldRef Name='Status' />" +
                "<FieldRef Name='TollGate_x0020_Category' />" +
                "</ViewFields>" +
                "<Joins>" +
                "<Join Type='LEFT' ListAlias='Program Tollgates'>" +
                "<Eq>" +
                "<FieldRef Name='Project' RefType='ID' />" +
                "<FieldRef Name='ID' List='Program Tollgates' />" +
                "</Eq>" +
                "</Join>" +
                "</Joins>" +
                "<ProjectedFields>" +
                "<Field ShowField='StatusText' Type='Lookup' Name='ProjectStatus' List='Program Tollgates' />" +
                "</ProjectedFields>" +
                "<Query>" +
                "<Where>" +
                "<And>" +
                "<Or>" +
                "<Eq>" +
                "<FieldRef Name='Status' />" +
                "<Value Type='Choice'>In-Progress</Value>" +
                "</Eq>" +
                "<Eq>" +
                "<FieldRef Name='Status' />" +
                "<Value Type='Choice'>Completed</Value>" +
                "</Eq>" +
                "</Or>" +
                "<Neq>" +
                "<FieldRef Name='ProjectStatus' />" +
                "<Value Type='Text'>Cancelled</Value>" +
                "</Neq>" +
                "</And>" +
                "</Where>" +
                "</Query>" +
                "<QueryOptions />" +
                "</View>");
            var items = list.getItems(caml);
            clientContext.load(items);

            var o = { d: d, list: list, items: items };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        var p = getListItems();
        p.done(function(result) {
            var data = convertData(result.items);
            drawCallback(data);
        });
        p.fail(function(result) {
            var error = result;
        });

        function convertData(listItemCollection) {
            var data = [];
            if (!!listItemCollection) {
                var enumerator = listItemCollection.getEnumerator();
                while (enumerator.moveNext()) {
                    var listItem = enumerator.get_current();
                    var initialDataRow = {
                        tollgateCategory: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.programTollgate.category)),
                        status: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.programTollgate.status))
                    };
                    data.push(initialDataRow);
                }
            }
            return data;
        }
    }

    self.costBarChart_getDataAndDraw = function(drawCallback) {
        function getListItems() {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Program Management');
            var caml = new SP.CamlQuery();
            caml.set_viewXml("<View><Query><Where><Or><Eq><FieldRef Name='Status' /><Value Type='Choice'>In Progress</Value></Eq><Eq><FieldRef Name='Status' /><Value Type='Choice'>Proposed</Value></Eq></Or></Where></Query></View>"); //SP.CamlQuery.createAllItemsQuery();
            var items = list.getItems(caml);
            clientContext.load(items);

            var o = { d: d, list: list, items: items };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        var p = getListItems();
        p.done(function(result) {
            var data = convertData(result.items);
            drawCallback(data);
        });
        p.fail(function(result) {
            var error = result;
        });

        function convertData(listItemCollection) {
            var data = [];
            if (!!listItemCollection) {
                var enumerator = listItemCollection.getEnumerator();
                while (enumerator.moveNext()) {
                    var listItem = enumerator.get_current();
                    var initialDataRow = {
                        capitalCosts: spjediChartHelper.getNumberOrZero(listItem.get_item(CONST.programManagement.capitalCosts)),
                        projectDevCost: spjediChartHelper.getNumberOrZero(listItem.get_item(CONST.programManagement.projectDevCost))
                    };
                    data.push(initialDataRow);
                }
            }
            return data;
        }
    }

    self.costPieChart_getDataAndDraw = function(drawCallback) {
        function getListItems() {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Program Management');
            var caml = new SP.CamlQuery();
            caml.set_viewXml("<View><Query><Where><Or><Eq><FieldRef Name='Status' /><Value Type='Choice'>In Progress</Value></Eq><Eq><FieldRef Name='Status' /><Value Type='Choice'>Proposed</Value></Eq></Or></Where></Query><ViewFields><FieldRef Name='" + CONST.programManagement.calculatedMargin + "' /></ViewFields><QueryOptions /></View>");
            var items = list.getItems(caml);
            clientContext.load(items);

            var o = { d: d, list: list, items: items };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        var p = getListItems();
        p.done(function(result) {
            var data = convertData(result.items);
            drawCallback(data);
        });
        p.fail(function(result) {
            var error = result;
        });

        function convertData(listItemCollection) {
            var data = [];
            if (!!listItemCollection) {
                var enumerator = listItemCollection.getEnumerator();
                while (enumerator.moveNext()) {
                    var listItem = enumerator.get_current();
                    var initialDataRow = {
                        calculatedMargin: spjediChartHelper.getNumberOrZero(listItem.get_item(CONST.programManagement.calculatedMargin))
                    };
                    data.push(initialDataRow);
                }
            }
            return data;
        }
    }

    self.projectFlter_getDataAndDraw = function(drawCallback) {
        function getListItems() {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Program Management');
            var caml = new SP.CamlQuery();
            caml.set_viewXml("<View><Query /><ViewFields><FieldRef Name='Title' /><FieldRef Name='ID' /></ViewFields><QueryOptions /></View>");
            var items = list.getItems(caml);
            clientContext.load(items);

            var o = { d: d, list: list, items: items };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        var p = getListItems();
        p.done(function(result) {
            var data = convertData(result.items);
            drawCallback(data);
        });
        p.fail(function(result) {
            var error = result;
        });

        function convertData(listItemCollection) {
            var data = [];
            if (!!listItemCollection) {
                var enumerator = listItemCollection.getEnumerator();
                while (enumerator.moveNext()) {
                    var listItem = enumerator.get_current();
                    var initialDataRow = {
                        projectName: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.programManagement.projectName)),
                        id: spjediChartHelper.getTextOrEmpty(listItem.get_item("ID"))
                    };
                    data.push(initialDataRow);
                }
            }
            return data;
        }
    }

    self.projectFlter_getDataFromCacheAndDraw = function(drawCallback) {
        drawCallback(DATAPROVIDER.allProjectData); // it must be initialized before
    }

    self.projectCategoryFilter_getDataAndDraw = function(drawCallback) {
        function getListItems() {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Program Management');
            var caml = new SP.CamlQuery();
            caml.set_viewXml("<View><Query /><ViewFields><FieldRef Name='Category' /><FieldRef Name='ID' /></ViewFields><QueryOptions /></View>");
            var items = list.getItems(caml);
            clientContext.load(items);

            var o = { d: d, list: list, items: items };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        var p = getListItems();
        p.done(function(result) {
            var data = convertData(result.items);
            drawCallback(data);
        });
        p.fail(function(result) {
            var error = result;
        });

        function convertData(listItemCollection) {
            var data = [];
            if (!!listItemCollection) {
                var enumerator = listItemCollection.getEnumerator();
                while (enumerator.moveNext()) {
                    var listItem = enumerator.get_current();
                    var initialDataRow = {
                        categoryName: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.programManagement.category)),
                        id: spjediChartHelper.getTextOrEmpty(listItem.get_item("ID"))
                    };
                    data.push(initialDataRow);
                }
            }
            return data;
        }
    }

    self.projectCategoryFilter_getDataFromCacheAndDraw = function(drawCallback) {
        drawCallback(DATAPROVIDER.allProjectData); // it must be initialized before
    }

    self.projectGanttChart_getDataAndDraw = function(drawCallback, projectId) {
        if (typeof(projectId) !== 'undefined' && projectId != null) {
            var p = getListItems(projectId);
            p.done(function(result) {
                var data = convertData(result.items);
                drawCallback(data);
            });
            p.fail(function(result) {
                var error = result;
            });
        } else {
            drawCallback(null);
        }

        function getListItems(projectId) {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Program Management');
            //var caml = new SP.CamlQuery();
            //caml.set_viewXml("<View><Query><Where><Eq><FieldRef Name='ID' /><Value Type='Counter'>1</Value></Eq></Where></Query>"
            //    + "<ViewFields><FieldRef Name='Title' /><FieldRef Name='ID' /><FieldRef Name='Discovery_x0020_Status_x0020_Sta' /><FieldRef Name='Prospect_x0020_Status_x0020_End_' /><FieldRef Name='Prospect_x0020_Status_x0020_Star' /><FieldRef Name='Discovery_x0020_Status_x0020_End' /><FieldRef Name='CV_x0020_Status_x0020_Start_x002' /><FieldRef Name='CV_x0020_Status_x0020_End_x0020_' /><FieldRef Name='DV_x0020_Status_x0020_Start_x002' /><FieldRef Name='DV_x0020_Status_x0020_End_x0020_' /><FieldRef Name='PV_x0020_Status_x0020_Start_x002' /><FieldRef Name='PV_x0020_Status_x0020_End_x0020_' /></ViewFields><QueryOptions /></View>");
            var item = list.getItemById(projectId);
            clientContext.load(item);

            var o = { d: d, list: list, items: item };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        function convertData(listItem) {
            return initialDataRow = {
                projectName: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.programManagement.projectName)),
                id: spjediChartHelper.getTextOrEmpty(listItem.get_item("ID")),
                discoveryStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.discoveryStartDate)),
                discoveryEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.discoveryEndDate)),
                prospectStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.prospectStartDate)),
                prospectEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.prospectEndDate)),
                cvStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.cvStartDate)),
                cvEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.cvEndDate)),
                dvStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.dvStartDate)),
                dvEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.dvEndDate)),
                pvStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.pvStartDate)),
                pvEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.pvEndDate))
            };
            //data.push(initialDataRow);                        
        }
    }

    self.costProjectPieChart_getDataAndDraw = function(drawCallback, projectId) {
        if (typeof(projectId) !== 'undefined' && projectId != null) {
            var p = getListItems(projectId);
            p.done(function(result) {
                var data = convertData(result.items);
                drawCallback(data);
            });
            p.fail(function(result) {
                var error = result;
            });
        } else {
            drawCallback(null);
        }

        function getListItems(projectId) {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            //var list = clientContext.get_web().get_lists().getByTitle('Program Management');
            var list = clientContext.get_web().get_lists().getByTitle('Adjusted Parent BOM');
            var caml = new SP.CamlQuery();
            caml.set_viewXml("<View><Query><Where><Eq><FieldRef Name='Project' LookupId='TRUE'/><Value Type='Lookup' >" + projectId + "</Value></Eq></Where></Query><QueryOptions /></View>");
            var items = list.getItems(caml); //list.getItemById(projectId);
            clientContext.load(items);

            var o = { d: d, list: list, items: items };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        function convertData(listItems) {
            if (listItems.get_count() > 0)
                return initialDataRow = {
                    adjSubMaterialCost: spjediChartHelper.getNumberOrZero(listItems.itemAt(0).get_item(CONST.adjustedParentBOM.materialCost)),
                    adjSubLabourCost: spjediChartHelper.getNumberOrZero(listItems.itemAt(0).get_item(CONST.adjustedParentBOM.labourCost)),
                    adjSubFixOverhead: spjediChartHelper.getNumberOrZero(listItems.itemAt(0).get_item(CONST.adjustedParentBOM.fixOverhead)),
                    adjSubVariableOverhead: spjediChartHelper.getNumberOrZero(listItems.itemAt(0).get_item(CONST.adjustedParentBOM.variableOverhead))
                };
            else
                return initialDataRow = {
                    adjSubMaterialCost: 0,
                    adjSubLabourCost: 0,
                    adjSubFixOverhead: 0,
                    adjSubVariableOverhead: 0
                };
        }
    }

    self.costProjectBarChart_getDataAndDraw = function(drawCallback, projectId) {
        if (typeof(projectId) !== 'undefined' && projectId != null) {
            var p = getListItems(projectId);
            p.done(function(result) {
                var data = convertData(result.item);
                drawCallback(data);
            });
            p.fail(function(result) {
                var error = result;
            });
        } else {
            drawCallback(null);
        }


        function getListItems(projectId) {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Program Management');
            var caml = new SP.CamlQuery();
            //caml.set_viewXml("<View><Query><Where><Or><Eq><FieldRef Name='Status' /><Value Type='Choice'>In Progress</Value></Eq><Eq><FieldRef Name='Status' /><Value Type='Choice'>Proposed</Value></Eq></Or></Where></Query></View>");//SP.CamlQuery.createAllItemsQuery();
            var item = list.getItemById(projectId); // getItems(caml);
            clientContext.load(item);

            var o = { d: d, list: list, item: item };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        function convertData(listItem) {
            var initialDataRow = {
                capitalCosts: spjediChartHelper.getNumberOrZero(listItem.get_item(CONST.programManagement.capitalCosts)),
                projectDevCost: spjediChartHelper.getNumberOrZero(listItem.get_item(CONST.programManagement.projectDevCost))
            };

            return initialDataRow;
        }
    }

    self.loadAllProjectData = function() {
        ALL_PROJECT_DATA = INITIAL_DATA_GANNT;
    }

    self.taskGrid_getDataAndDraw = function(drawCallback, projectId) {
        var urlTemplate = "";
        if (typeof(projectId) !== 'undefined' && projectId != null) {
            var p = getListItems(projectId);
            p.done(function(result) {
                urlTemplate = result.list.get_defaultDisplayFormUrl();
                var data = convertData(result.items, urlTemplate);
                drawCallback(data);
            });
            p.fail(function(result) {
                var error = result;
            });
        } else {
            drawCallback(null);
        }

        function getListItems(projectId) {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Program Tollgates');
            var caml = new SP.CamlQuery();
            caml.set_viewXml("<View><Query><Where><And><Eq><FieldRef Name='Project' LookupId='TRUE'/><Value Type='Lookup' >" + projectId + "</Value></Eq><Eq><FieldRef Name='Report_x0020_Task' /><Value Type='Choice'>Yes</Value></Eq></And></Where></Query><ViewFields><FieldRef Name='Title' /><FieldRef Name='ID' /><FieldRef Name='Project' /><FieldRef Name='Report_x0020_Task' /></ViewFields><QueryOptions /></View>");
            var items = list.getItems(caml);
            clientContext.load(list, "DefaultDisplayFormUrl");
            clientContext.load(items);

            var o = { d: d, list: list, items: items };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        function convertData(listItemCollection, _urlTemplate) {
            var data = [];
            if (!!listItemCollection) {
                var enumerator = listItemCollection.getEnumerator();
                while (enumerator.moveNext()) {
                    var listItem = enumerator.get_current();
                    var initialDataRow = {
                        taskName: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.programTollgate.taskName)),
                        id: spjediChartHelper.getTextOrEmpty(listItem.get_item("ID")),
                        url: _urlTemplate + "?ID=" + spjediChartHelper.getTextOrEmpty(listItem.get_item("ID"))
                    };
                    data.push(initialDataRow);
                }
            }
            return data;
        }
    }

    self.riskGrid_getDataAndDraw = function(drawCallback, projectId) {
        var urlTemplate = "";
        if (typeof(projectId) !== 'undefined' && projectId != null) {
            var p = getListItems(projectId);
            p.done(function(result) {
                urlTemplate = result.list.get_defaultDisplayFormUrl();
                var data = convertData(result.items, urlTemplate);
                drawCallback(data);
            });
            p.fail(function(result) {
                var error = result;
            });
        } else {
            drawCallback(null);
        }

        function getListItems(projectId) {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Risks');
            var caml = new SP.CamlQuery();
            caml.set_viewXml("<View><Query><Where><And><Eq><FieldRef Name='Project' LookupId='TRUE'/><Value Type='Lookup'>" + projectId + "</Value></Eq><Eq><FieldRef Name='Risk_x0020_Status' /><Value Type='Choice'>Active</Value></Eq></And></Where></Query></View>");
            var items = list.getItems(caml);
            clientContext.load(list, "DefaultDisplayFormUrl");
            clientContext.load(items);

            var o = { d: d, list: list, items: items };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        function convertData(listItemCollection, _urlTemplate) {
            var data = [];
            if (!!listItemCollection) {
                var enumerator = listItemCollection.getEnumerator();
                while (enumerator.moveNext()) {
                    var listItem = enumerator.get_current();
                    var initialDataRow = {
                        riskName: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.programTollgate.taskName)),
                        id: spjediChartHelper.getTextOrEmpty(listItem.get_item("ID")),
                        url: _urlTemplate + "?ID=" + spjediChartHelper.getTextOrEmpty(listItem.get_item("ID")),
                        overallRiskScore: spjediChartHelper.getNumberOrZero(listItem.get_item(CONST.risk.overallRiskScore), true),
                        riskDescription: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.risk.riskDescription)),
                        riskMigrationDescription: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.risk.riskMigrationDescription)),
                        riskMitigation: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.risk.riskMitigation)),
                    };
                    data.push(initialDataRow);
                }
            }
            return data;
        }
    }

    self.projectMagnifyingLink_getDataAndDraw = function(drawCallback, projectId) {
        if (typeof(projectId) !== 'undefined' && projectId != null) {
            var p = getListItems(projectId);
            p.done(function(result) {
                var data = convertData(result.item);
                drawCallback(data);
            });
            p.fail(function(result) {
                var error = result;
            });
        } else {
            drawCallback(null);
        }


        function getListItems(projectId) {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Program Management');
            var caml = new SP.CamlQuery();
            //caml.set_viewXml("<View><Query><Where><Or><Eq><FieldRef Name='Status' /><Value Type='Choice'>In Progress</Value></Eq><Eq><FieldRef Name='Status' /><Value Type='Choice'>Proposed</Value></Eq></Or></Where></Query></View>");//SP.CamlQuery.createAllItemsQuery();
            var item = list.getItemById(projectId); // getItems(caml);
            clientContext.load(item);

            var o = { d: d, list: list, item: item };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        function convertData(listItem) {
            var initialDataRow = {
                projectCostChartLink: spjediChartHelper.getLink(listItem.get_item(CONST.programManagement.projectCostChartLink))
            };

            return initialDataRow;
        }
    }

    self.stockPhotoLink_getDataAndDraw = function(drawCallback, projectId) {
        if (typeof(projectId) !== 'undefined' && projectId != null) {
            var p = getListItems(projectId);
            p.done(function(result) {
                var data = convertData(result.item);
                drawCallback(data);
            });
            p.fail(function(result) {
                var error = result;
            });
        } else {
            drawCallback(null);
        }


        function getListItems(projectId) {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Program Management');
            var caml = new SP.CamlQuery();
            //caml.set_viewXml("<View><Query><Where><Or><Eq><FieldRef Name='Status' /><Value Type='Choice'>In Progress</Value></Eq><Eq><FieldRef Name='Status' /><Value Type='Choice'>Proposed</Value></Eq></Or></Where></Query></View>");//SP.CamlQuery.createAllItemsQuery();
            var item = list.getItemById(projectId); // getItems(caml);
            clientContext.load(item);

            var o = { d: d, list: list, item: item };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        function convertData(listItem) {
            var _stockPhotoLink = spjediChartHelper.getLink_2(listItem.get_item(CONST.programManagement.stockPhotoLink));
            var initialDataRow = {
                stockPhotoLink: _stockPhotoLink.url,
                stockPhotoDescription: _stockPhotoLink.description
            };

            return initialDataRow;
        }
    }
    return self;
}(reportOfUnion || {}));

var CONST = {
    programManagement: {
        projectTiming: "Project_x0020_Timing",
        projectName: "Title",
        category: "Category",
        discoveryStartDate: "Discovery_x0020_Status_x0020_Sta",
        discoveryEndDate: "Discovery_x0020_Status_x0020_End",
        prospectStartDate: "Prospect_x0020_Status_x0020_Star",
        prospectEndDate: "Prospect_x0020_Status_x0020_End_",
        cvStartDate: "CV_x0020_Status_x0020_Start_x002",
        cvEndDate: "CV_x0020_Status_x0020_End_x0020_",
        dvStartDate: "DV_x0020_Status_x0020_Start_x002",
        dvEndDate: "DV_x0020_Status_x0020_End_x0020_",
        pvStartDate: "PV_x0020_Status_x0020_Start_x002",
        pvEndDate: "PV_x0020_Status_x0020_End_x0020_",
        capitalCosts: "Capital_x0020_Costs",
        projectDevCost: "Project_x0020_Dev_x0020_Cost",
        calculatedMargin: "Calculated_x0020_Margin",
        adjSubMaterialCost: "MaterialCost", //"AdjSubMaterialCost",
        adjSubLabourCost: "LabourCost", //"AdjSubLabourCost",
        adjSubFixOverhead: "FixOverhead", //"AdjSubFixOverhead",
        adjSubVariableOverhead: "VariableOverhead",
        projectCostChartLink: "ProjectCostChartLink", //"AdjSubVariableOverhead"
        stockPhotoLink: "Stockphoto"
    },
    risk: {
        severity: "Risk_x0020_Type",
        risk: 'Technical_x0020_Severity',
        overallRiskScore: 'Overall_x0020_Risk_x0020_Score',
        riskMitigation: "Risk_x0020_Mitigation",
        riskDescription: 'Risk_x0020_Description',
        riskMigrationDescription: 'Risk_x0020_Mitigation_x0020_Desc'
    },
    programTollgate: {
        status: 'Status',
        category: 'TollGate_x0020_Category',
        projectId: 'Project',
        taskName: 'Title',
        id: 'ID'
    },
    adjustedParentBOM: {
        materialCost: "MaterialCost",
        labourCost: "LabourCost",
        fixOverhead: "FixOverhead",
        variableOverhead: "VariableOverhead"
    }
};

var spjediChartHelper = {
    createGridRow: function(rowType, months) {
        var row = new Object();
        row.Region = "";
        row.Type = rowType;
        months.forEach(function(item) {
            row[item] = 0;
        });
        return row;
    },
    generateColorsForPieChart: function() {
        r = Math.floor(Math.random() * 200);
        g = Math.floor(Math.random() * 200);
        b = Math.floor(Math.random() * 200);
        v = Math.floor(Math.random() * 500);
        c = 'rgba(' + r + ', ' + g + ', ' + b + ', 0.2' + ')';
        h = 'rgba(' + r + ', ' + g + ', ' + b + ', 0.4' + ')';
        return { backgroundColor: c, hoverBackgroundColor: h };
    },
    getValueFromLookup: function(fieldValue) {
        var _emptyString = "(empty)";
        if (fieldValue && fieldValue.get_lookupValue())
            return fieldValue.get_lookupValue();
        else
            return _emptyString;
    },
    getTextOrEmpty: function(fieldValue) {
        if (fieldValue)
            return fieldValue;
        else
            return "";
    },
    getNumberOrZero: function(fieldValue, round) {
        if (fieldValue) {
            if (round)
                return Math.round(fieldValue);
            return fieldValue;
        } else
            return 0;
    },
    getDateValue: function(fieldValue, round) {
        if (round && fieldValue instanceof Date) {
            fieldValue.setHours(0);
            fieldValue.setMinutes(0);
            fieldValue.setSeconds(0);
        }
        return fieldValue;
    },

    /** used if field contains text with <a> tag */
    getLink: function(fieldValue) {
        try {
            if (fieldValue)
                return $(fieldValue).attr('href');
            else
                return "#";
        } catch (ex) {
            return "#";
        }
    },

    /** used for fields with Hyperlink type */
    getLink_2: function(fieldValue) {
        try {
            if (fieldValue)
                return { url: fieldValue.get_url(), description: fieldValue.get_description() };
            else
                return { url: "", description: "" };
        } catch (ex) {
            return { url: "#", description: "" };
        }
    }
};

FILTERS.projectFilter = (function(self) {
    self.dataLoader.loadAllData = function() {
        function getListItems(projectId) {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Program Management');
            var caml = SP.CamlQuery.createAllItemsQuery();
            var items = list.getItems(caml);
            clientContext.load(items);

            var o = { d: d, list: list, items: items };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        function convertData(listItemCollection) {
            var data = [];
            if (!!listItemCollection) {
                var enumerator = listItemCollection.getEnumerator();
                while (enumerator.moveNext()) {
                    var listItem = enumerator.get_current();
                    var initialDataRow = {
                        projectName: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.programManagement.projectName)),
                        category: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.programManagement.category)),
                        id: spjediChartHelper.getTextOrEmpty(listItem.get_item("ID")),
                        discoveryStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.discoveryStartDate)),
                        discoveryEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.discoveryEndDate)),
                        prospectStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.prospectStartDate)),
                        prospectEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.prospectEndDate)),
                        cvStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.cvStartDate)),
                        cvEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.cvEndDate)),
                        dvStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.dvStartDate)),
                        dvEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.dvEndDate)),
                        pvStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.pvStartDate)),
                        pvEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.pvEndDate))
                    };
                    data.push(initialDataRow);
                }
            }
            return data;
        }

        var p = getListItems();
        p.done(function(result) {
            self.allData = convertData(result.items);
        });
        p.fail(function(result) {
            var error = result;
        });
    }
    return self;
}(FILTERS.projectFilter || {}));

DATAPROVIDER = (function(self) {
    self.allProjectData;
    self.loadAllProjectData = function(onSuccess, onFail) {
        function getListItems(projectId) {
            var d = $.Deferred();
            var clientContext = SP.ClientContext.get_current();
            var list = clientContext.get_web().get_lists().getByTitle('Program Management');
            var caml = new SP.CamlQuery();
            //projects with statuses Proposed and In Progress
            caml.set_viewXml("<View><Query><Where><Or><Eq><FieldRef Name='Status' /><Value Type='Choice'>Proposed</Value></Eq><Eq><FieldRef Name='Status' /><Value Type='Choice'>In Progress</Value></Eq></Or></Where></Query></View>");
            var items = list.getItems(caml);
            clientContext.load(items);

            var o = { d: d, list: list, items: items };
            clientContext.executeQueryAsync(Function.createDelegate(o, function() { this.d.resolve(this); }), Function.createDelegate(o, function() { this.d.reject("something bad happened"); }));

            return d.promise();
        }

        function convertData(listItemCollection) {
            var data = [];
            if (!!listItemCollection) {
                var enumerator = listItemCollection.getEnumerator();
                while (enumerator.moveNext()) {
                    var listItem = enumerator.get_current();
                    var initialDataRow = {
                        projectName: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.programManagement.projectName)),
                        category: spjediChartHelper.getTextOrEmpty(listItem.get_item(CONST.programManagement.category)),
                        id: spjediChartHelper.getTextOrEmpty(listItem.get_item("ID")),
                        discoveryStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.discoveryStartDate), true),
                        discoveryEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.discoveryEndDate), true),
                        prospectStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.prospectStartDate), true),
                        prospectEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.prospectEndDate), true),
                        cvStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.cvStartDate), true),
                        cvEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.cvEndDate), true),
                        dvStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.dvStartDate), true),
                        dvEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.dvEndDate), true),
                        pvStartDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.pvStartDate), true),
                        pvEndDate: spjediChartHelper.getDateValue(listItem.get_item(CONST.programManagement.pvEndDate), true),
                        capitalCosts: spjediChartHelper.getNumberOrZero(listItem.get_item(CONST.programManagement.capitalCosts)),
                        projectDevCost: spjediChartHelper.getNumberOrZero(listItem.get_item(CONST.programManagement.projectDevCost)),
                        projectCostChartLink: spjediChartHelper.getLink(listItem.get_item(CONST.programManagement.projectCostChartLink)),
                        stockPhotoLink: spjediChartHelper.getLink_2(listItem.get_item(CONST.programManagement.stockPhotoLink)).url,
                        stockPhotoDescription: spjediChartHelper.getLink_2(listItem.get_item(CONST.programManagement.stockPhotoLink)).description,
                    };
                    data.push(initialDataRow);
                }
            }
            return data;
        }

        var p = getListItems();
        p.done(function(result) {
            self.allProjectData = convertData(result.items);
            onSuccess();
        });
        p.fail(function(result) {
            var error = result;
            onFail();
        });
    }

    return self;
}(DATAPROVIDER || {}));