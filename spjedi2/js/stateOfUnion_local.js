var reportOfUnion = (function (self) {
    var _default = {};
    _default.pieChart = {};
    _default.pieChart.options = {
       // responsive: true
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
       // responsive: true,       
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
                rows.push([initialData.id + 'discovery', 'Phase 1',
                    initialData.discoveryStartDate, initialData.discoveryEndDate, null, 0, null]);
            //prospect
            if (initialData.prospectStartDate != null && initialData.prospectEndDate != null)
                rows.push([initialData.id + 'prospect', 'Phase 2',
                    initialData.prospectStartDate, initialData.prospectEndDate, null, 0, null]);
            //cv
            if (initialData.cvStartDate != null && initialData.cvEndDate != null)
                rows.push([initialData.id + 'cv', 'Phase 3',
                    initialData.cvStartDate, initialData.cvEndDate, null, 0, null]);
            //dv
            if (initialData.dvStartDate != null && initialData.dvEndDate != null)
                rows.push([initialData.id + 'dv', 'Phase 4',
                    initialData.dvStartDate, initialData.dvEndDate, null, 0, null]);
            //pv
            if (initialData.pvStartDate != null && initialData.pvEndDate != null)
                rows.push([initialData.id + 'pv', 'Phase 5',
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
    { projectName: 'Project 1', status: 'Proposed', id: 1, category: 'Finance' },
    { projectName: 'Project 2', status: 'In Progress', id: 2, category: 'Finance' },
    { projectName: 'Project 3', status: '111', id: 3, category: 'Operations' }
]

INITIAL_DATA_PROJECTCATEGORIES = [
    { categoryName: "Finance" },
    { categoryName: "Operations" },
    { categoryName: "Operations" }
]

INITIAL_DATA_GANNT = [{
        id: 1,
        projectName: 'project 1',
        category: "Finance",
        discoveryStartDate: new Date(2017, 1, 1),
        discoveryEndDate: new Date(2017, 1, 5),
        prospectStartDate: new Date(2017, 1, 6),
        prospectEndDate: new Date(2017, 1, 15),
        cvStartDate: new Date(2017, 1, 16),
        cvEndDate: new Date(2017, 1, 21),
        dvStartDate: new Date(2017, 1, 22),
        dvEndDate: new Date(2017, 1, 31),
        pvStartDate: new Date(2017, 2, 1),
        pvEndDate: new Date(2017, 2, 16),
        capitalCosts: 33,
        projectDevCost: 66,
        calculatedMargin: 0.5,
        adjSubMaterialCost: 11,
        adjSubLabourCost: 50,
        adjSubFixOverhead: 70,
        adjSubVariableOverhead: 41,
        projectCostChartLink: 'http://google.com',
        stockPhotoLink: 'http://www.w3schools.com/css/img_fjords.jpg',
        stockPhotoDescription: "Description 1"
    },
    {
        id: 2,
        projectName: 'project 2',
        category: "Finance",
        discoveryStartDate: new Date(2017, 2, 1),
        discoveryEndDate: new Date(2017, 2, 5),
        prospectStartDate: new Date(2017, 2, 6),
        prospectEndDate: new Date(2017, 2, 15),
        cvStartDate: new Date(2017, 2, 16),
        cvEndDate: new Date(2017, 2, 21),
        dvStartDate: new Date(2017, 2, 22),
        dvEndDate: new Date(2017, 2, 28),
        pvStartDate: new Date(2017, 3, 1),
        pvEndDate: new Date(2017, 2, 16),
        capitalCosts: 12,
        projectDevCost: 43,
        calculatedMargin: 0.02,
        adjSubMaterialCost: 112,
        adjSubLabourCost: 503,
        adjSubFixOverhead: 701,
        adjSubVariableOverhead: 412,
        projectCostChartLink: 'http://yandex.ru',
        stockPhotoLink: 'https://s3-us-west-1.amazonaws.com/powr/defaults/image-slider2.jpg'
    },
    {
        id: 3,
        projectName: 'project 3',
        category: "Operations",
        discoveryStartDate: new Date(2017, 2, 1),
        discoveryEndDate: new Date(2017, 2, 5),
        prospectStartDate: new Date(2017, 2, 6),
        prospectEndDate: new Date(2017, 2, 15),
        cvStartDate: new Date(2017, 2, 16),
        cvEndDate: new Date(2017, 2, 21),
        dvStartDate: new Date(2017, 2, 22),
        dvEndDate: new Date(2017, 2, 28),
        pvStartDate: new Date(2017, 3, 1),
        pvEndDate: new Date(2017, 2, 16),
        capitalCosts: 23,
        projectDevCost: 78,
        calculatedMargin: 0.07,
        adjSubMaterialCost: 112,
        adjSubLabourCost: 501,
        adjSubFixOverhead: 702,
        adjSubVariableOverhead: 413,
        projectCostChartLink: 'http://ya.ru',
        stockPhotoLink: ''
    }
]

INITIAL_DATA_TASKS = [
    { taskName: 'task 1', projectId: 1, id: 1, url: "http://spjedi.com/project" },
    { taskName: 'task 2', projectId: 2, id: 2, url: "http://spjedi.com/project" },
    { taskName: 'task 3', projectId: 2, id: 3, url: "http://spjedi.com/project" },
    { taskName: 'task 4', projectId: 1, id: 4, url: "http://spjedi.com/project" },
    { taskName: 'task 4-2', projectId: 3, id: 5, url: "http://spjedi.com/project" },
    { taskName: 'task 5', projectId: 4, id: 6, url: "http://spjedi.com/project" },
    { taskName: 'task 6', projectId: 3, id: 7, url: "http://spjedi.com/project" },
    { taskName: 'task 7', projectId: 3, id: 8, url: "http://spjedi.com/project" },
    { taskName: 'task 8', projectId: 2, id: 9, url: "http://spjedi.com/project" },
    { taskName: 'task 9', projectId: 1, id: 10, url: "http://spjedi.com/project" },
];

INITIAL_DATA_RISKS_PROJECT = [
    { riskName: 'Name 1', projectId: 1, overallRiskScore: 30, riskDescription: 'Risk Description 1', riskMigrationDescription: 'Description 1', id: 1, url: 'http://spjedi.com/project' },
    { riskName: 'Name 2', projectId: 1, overallRiskScore: 77, riskDescription: 'Risk Description 2', riskMigrationDescription: 'Description 2', id: 2, url: 'http://spjedi.com/project' },
    { riskName: 'Name 3', projectId: 1, overallRiskScore: 40, riskDescription: 'Risk Description 3', riskMigrationDescription: 'Description 3', id: 3, url: 'http://spjedi.com/project' },
    { riskName: 'Name 4', projectId: 1, overallRiskScore: 75, riskDescription: 'Risk Description 4', riskMigrationDescription: 'Description 4', id: 4, url: 'http://spjedi.com/project' },
    { riskName: 'Name 5', projectId: 1, overallRiskScore: 10, riskDescription: 'Risk Description 5', riskMigrationDescription: 'Description 5', id: 5, url: 'http://spjedi.com/project' },
    { riskName: 'Name 6', projectId: 1, overallRiskScore: 77, riskDescription: 'Risk Description 6', riskMigrationDescription: 'Description 6', id: 6, url: 'http://spjedi.com/project' },
    { riskName: 'Name 7', projectId: 1, overallRiskScore: 71, riskDescription: 'Risk Description 7', riskMigrationDescription: 'Description 7', id: 7, url: 'http://spjedi.com/project' },
    { riskName: 'Name 8', projectId: 2, overallRiskScore: 60, riskDescription: 'Risk Description 8', riskMigrationDescription: 'Description 8', id: 8, url: 'http://spjedi.com/project' },
    { riskName: 'Name 9', projectId: 2, overallRiskScore: 75, riskDescription: 'Risk Description 9', riskMigrationDescription: 'Description 9', id: 9, url: 'http://spjedi.com/project' },
    { riskName: 'Name 10', projectId: 2, overallRiskScore: 40, riskDescription: 'Risk Description 10', riskMigrationDescription: 'Description 10', id: 10, url: 'http://spjedi.com/project' },

]

var reportOfUnion = (function(self) {
    self.timingChart_getDataAndDraw = function(drawCallback) {
        drawCallback(INITIAL_DATA_TIMING);
    }
    self.riskChart_getDataAndDraw = function(drawCallback) {
        //drawCallback(INITIAL_DATA_RISKS);
        drawCallback(INITIAL_DATA_RISKS_PROJECT);
    }
    self.actionsGrid_getDataAndDraw = function(drawCallback) {
        drawCallback(INITIAL_DATA_ACTIONS);
    }
    self.costBarChart_getDataAndDraw = function(drawCallBack) {
        drawCallBack(INITIAL_DATA_GANNT);
    }
    self.costPieChart_getDataAndDraw = function(drawCallBack) {
        drawCallBack(INITIAL_DATA_GANNT);
    }
    self.projectFlter_getDataAndDraw = function(drawCallback) {
        drawCallback(INITIAL_DATA_PROJECTS);
    }

    self.projectFlter_getDataFromCacheAndDraw = function(drawCallback) {
        drawCallback(DATAPROVIDER.allProjectData);
    }

    self.projectCategoryFilter_getDataAndDraw = function(drawCallback) {
        //drawCallback(INITIAL_DATA_PROJECTCATEGORIES);
        drawCallback(DATAPROVIDER.allProjectData); //it must be loaded before
    }

    self.projectCategoryFilter_getDataFromCacheAndDraw = function(drawCallback) {
        drawCallback(DATAPROVIDER.allProjectData); // it must be initialized before
    }

    self.projectGanttChart_getDataAndDraw = function(drawCallback, projectId) {
        if (typeof(projectId) !== 'undefined' && projectId != null) {
            var d = new jinqJs().from(INITIAL_DATA_GANNT)
                .where('id = ' + projectId)
                .select();

            if (Object.prototype.toString.call(d) === '[object Array]') {
                if (d.length > 0) d = d[0];
                else d = null;
            }
            drawCallback(d);
        } else
            drawCallback(null);
    }

    self.costProjectPieChart_getDataAndDraw = function(drawCallback, projectId) {
        if (typeof(projectId) !== 'undefined' && projectId != null) {
            var d = new jinqJs().from(INITIAL_DATA_GANNT)
                .where('id = ' + projectId)
                .select();

            if (Object.prototype.toString.call(d) === '[object Array]') {
                if (d.length > 0) d = d[0];
                else d = null;
            }
            drawCallback(d);
        } else
            drawCallback(null);
    }

    self.costProjectBarChart_getDataAndDraw = function(drawCallback, projectId) {
        if (typeof(projectId) !== 'undefined' && projectId != null) {
            var d = new jinqJs().from(INITIAL_DATA_GANNT)
                .where('id = ' + projectId)
                .select();

            if (Object.prototype.toString.call(d) === '[object Array]') {
                if (d.length > 0) d = d[0];
                else d = null;
            }
            drawCallback(d);
        } else
            drawCallback(null);
    }

    self.loadAllProjectData = function() {
        ALL_PROJECT_DATA = INITIAL_DATA_GANNT;
    }

    self.taskGrid_getDataAndDraw = function(drawCallback, projectId) {
        var tasks = new jinqJs().from(INITIAL_DATA_TASKS).
        where('projectId = ' + projectId)
            .select();
        drawCallback(tasks);
    }

    self.riskGrid_getDataAndDraw = function(drawCallback, projectId) {
        var risks = new jinqJs().from(INITIAL_DATA_RISKS_PROJECT).
        where('projectId = ' + projectId)
            .select();
        drawCallback(risks);
    }

    self.projectMagnifyingLink_getDataAndDraw = function(drawCallback, projectId) {
        if (typeof(projectId) !== 'undefined' && projectId != null) {
            var d = new jinqJs().from(INITIAL_DATA_GANNT)
                .where('id = ' + projectId)
                .select();

            if (Object.prototype.toString.call(d) === '[object Array]') {
                if (d.length > 0) d = d[0];
                else d = null;
            }
            drawCallback(d);
        } else
            drawCallback(null);
    }

    self.stockPhotoLink_getDataAndDraw = function(drawCallback, projectId) {
        if (typeof(projectId) !== 'undefined' && projectId != null) {
            var d = new jinqJs().from(INITIAL_DATA_GANNT)
                .where('id = ' + projectId)
                .select();

            if (Object.prototype.toString.call(d) === '[object Array]') {
                if (d.length > 0) d = d[0];
                else d = null;
            }
            drawCallback(d);
        } else
            drawCallback(null);
    }

    return self;
}(reportOfUnion || {}));

FILTERS.projectFilter = (function(self) {
    self.dataLoader.loadAllData = function() {
        return INITIAL_DATA_PROJECTS;
    }
    return self;
}(FILTERS.projectFilter || {}));

DATAPROVIDER = (function(self) {
    self.allProjectData;
    self.loadAllProjectData = function(onSuccess, onFail) {
        self.allProjectData = INITIAL_DATA_GANNT;
        onSuccess();
    }
    return self;
}(DATAPROVIDER || {}));
/*! fancyBox v2.1.5 fancyapps.com | fancyapps.com/fancybox/#license */
(function(s,H,f,w){var K=f("html"),q=f(s),p=f(H),b=f.fancybox=function(){b.open.apply(this,arguments)},J=navigator.userAgent.match(/msie/i),C=null,t=H.createTouch!==w,u=function(a){return a&&a.hasOwnProperty&&a instanceof f},r=function(a){return a&&"string"===f.type(a)},F=function(a){return r(a)&&0<a.indexOf("%")},m=function(a,d){var e=parseInt(a,10)||0;d&&F(a)&&(e*=b.getViewport()[d]/100);return Math.ceil(e)},x=function(a,b){return m(a,b)+"px"};f.extend(b,{version:"2.1.5",defaults:{padding:15,margin:20,
width:800,height:600,minWidth:100,minHeight:100,maxWidth:9999,maxHeight:9999,pixelRatio:1,autoSize:!0,autoHeight:!1,autoWidth:!1,autoResize:!0,autoCenter:!t,fitToView:!0,aspectRatio:!1,topRatio:0.5,leftRatio:0.5,scrolling:"auto",wrapCSS:"",arrows:!0,closeBtn:!0,closeClick:!1,nextClick:!1,mouseWheel:!0,autoPlay:!1,playSpeed:3E3,preload:3,modal:!1,loop:!0,ajax:{dataType:"html",headers:{"X-fancyBox":!0}},iframe:{scrolling:"auto",preload:!0},swf:{wmode:"transparent",allowfullscreen:"true",allowscriptaccess:"always"},
keys:{next:{13:"left",34:"up",39:"left",40:"up"},prev:{8:"right",33:"down",37:"right",38:"down"},close:[27],play:[32],toggle:[70]},direction:{next:"left",prev:"right"},scrollOutside:!0,index:0,type:null,href:null,content:null,title:null,tpl:{wrap:'<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',image:'<img class="fancybox-image" src="{href}" alt="" />',iframe:'<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen'+
(J?' allowtransparency="true"':"")+"></iframe>",error:'<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',closeBtn:'<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',next:'<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',prev:'<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'},openEffect:"fade",openSpeed:250,openEasing:"swing",openOpacity:!0,
openMethod:"zoomIn",closeEffect:"fade",closeSpeed:250,closeEasing:"swing",closeOpacity:!0,closeMethod:"zoomOut",nextEffect:"elastic",nextSpeed:250,nextEasing:"swing",nextMethod:"changeIn",prevEffect:"elastic",prevSpeed:250,prevEasing:"swing",prevMethod:"changeOut",helpers:{overlay:!0,title:!0},onCancel:f.noop,beforeLoad:f.noop,afterLoad:f.noop,beforeShow:f.noop,afterShow:f.noop,beforeChange:f.noop,beforeClose:f.noop,afterClose:f.noop},group:{},opts:{},previous:null,coming:null,current:null,isActive:!1,
isOpen:!1,isOpened:!1,wrap:null,skin:null,outer:null,inner:null,player:{timer:null,isActive:!1},ajaxLoad:null,imgPreload:null,transitions:{},helpers:{},open:function(a,d){if(a&&(f.isPlainObject(d)||(d={}),!1!==b.close(!0)))return f.isArray(a)||(a=u(a)?f(a).get():[a]),f.each(a,function(e,c){var l={},g,h,k,n,m;"object"===f.type(c)&&(c.nodeType&&(c=f(c)),u(c)?(l={href:c.data("fancybox-href")||c.attr("href"),title:f("<div/>").text(c.data("fancybox-title")||c.attr("title")).html(),isDom:!0,element:c},
f.metadata&&f.extend(!0,l,c.metadata())):l=c);g=d.href||l.href||(r(c)?c:null);h=d.title!==w?d.title:l.title||"";n=(k=d.content||l.content)?"html":d.type||l.type;!n&&l.isDom&&(n=c.data("fancybox-type"),n||(n=(n=c.prop("class").match(/fancybox\.(\w+)/))?n[1]:null));r(g)&&(n||(b.isImage(g)?n="image":b.isSWF(g)?n="swf":"#"===g.charAt(0)?n="inline":r(c)&&(n="html",k=c)),"ajax"===n&&(m=g.split(/\s+/,2),g=m.shift(),m=m.shift()));k||("inline"===n?g?k=f(r(g)?g.replace(/.*(?=#[^\s]+$)/,""):g):l.isDom&&(k=c):
"html"===n?k=g:n||g||!l.isDom||(n="inline",k=c));f.extend(l,{href:g,type:n,content:k,title:h,selector:m});a[e]=l}),b.opts=f.extend(!0,{},b.defaults,d),d.keys!==w&&(b.opts.keys=d.keys?f.extend({},b.defaults.keys,d.keys):!1),b.group=a,b._start(b.opts.index)},cancel:function(){var a=b.coming;a&&!1===b.trigger("onCancel")||(b.hideLoading(),a&&(b.ajaxLoad&&b.ajaxLoad.abort(),b.ajaxLoad=null,b.imgPreload&&(b.imgPreload.onload=b.imgPreload.onerror=null),a.wrap&&a.wrap.stop(!0,!0).trigger("onReset").remove(),
b.coming=null,b.current||b._afterZoomOut(a)))},close:function(a){b.cancel();!1!==b.trigger("beforeClose")&&(b.unbindEvents(),b.isActive&&(b.isOpen&&!0!==a?(b.isOpen=b.isOpened=!1,b.isClosing=!0,f(".fancybox-item, .fancybox-nav").remove(),b.wrap.stop(!0,!0).removeClass("fancybox-opened"),b.transitions[b.current.closeMethod]()):(f(".fancybox-wrap").stop(!0).trigger("onReset").remove(),b._afterZoomOut())))},play:function(a){var d=function(){clearTimeout(b.player.timer)},e=function(){d();b.current&&b.player.isActive&&
(b.player.timer=setTimeout(b.next,b.current.playSpeed))},c=function(){d();p.unbind(".player");b.player.isActive=!1;b.trigger("onPlayEnd")};!0===a||!b.player.isActive&&!1!==a?b.current&&(b.current.loop||b.current.index<b.group.length-1)&&(b.player.isActive=!0,p.bind({"onCancel.player beforeClose.player":c,"onUpdate.player":e,"beforeLoad.player":d}),e(),b.trigger("onPlayStart")):c()},next:function(a){var d=b.current;d&&(r(a)||(a=d.direction.next),b.jumpto(d.index+1,a,"next"))},prev:function(a){var d=
b.current;d&&(r(a)||(a=d.direction.prev),b.jumpto(d.index-1,a,"prev"))},jumpto:function(a,d,e){var c=b.current;c&&(a=m(a),b.direction=d||c.direction[a>=c.index?"next":"prev"],b.router=e||"jumpto",c.loop&&(0>a&&(a=c.group.length+a%c.group.length),a%=c.group.length),c.group[a]!==w&&(b.cancel(),b._start(a)))},reposition:function(a,d){var e=b.current,c=e?e.wrap:null,l;c&&(l=b._getPosition(d),a&&"scroll"===a.type?(delete l.position,c.stop(!0,!0).animate(l,200)):(c.css(l),e.pos=f.extend({},e.dim,l)))},
update:function(a){var d=a&&a.originalEvent&&a.originalEvent.type,e=!d||"orientationchange"===d;e&&(clearTimeout(C),C=null);b.isOpen&&!C&&(C=setTimeout(function(){var c=b.current;c&&!b.isClosing&&(b.wrap.removeClass("fancybox-tmp"),(e||"load"===d||"resize"===d&&c.autoResize)&&b._setDimension(),"scroll"===d&&c.canShrink||b.reposition(a),b.trigger("onUpdate"),C=null)},e&&!t?0:300))},toggle:function(a){b.isOpen&&(b.current.fitToView="boolean"===f.type(a)?a:!b.current.fitToView,t&&(b.wrap.removeAttr("style").addClass("fancybox-tmp"),
b.trigger("onUpdate")),b.update())},hideLoading:function(){p.unbind(".loading");f("#fancybox-loading").remove()},showLoading:function(){var a,d;b.hideLoading();a=f('<div id="fancybox-loading"><div></div></div>').click(b.cancel).appendTo("body");p.bind("keydown.loading",function(a){27===(a.which||a.keyCode)&&(a.preventDefault(),b.cancel())});b.defaults.fixed||(d=b.getViewport(),a.css({position:"absolute",top:0.5*d.h+d.y,left:0.5*d.w+d.x}));b.trigger("onLoading")},getViewport:function(){var a=b.current&&
b.current.locked||!1,d={x:q.scrollLeft(),y:q.scrollTop()};a&&a.length?(d.w=a[0].clientWidth,d.h=a[0].clientHeight):(d.w=t&&s.innerWidth?s.innerWidth:q.width(),d.h=t&&s.innerHeight?s.innerHeight:q.height());return d},unbindEvents:function(){b.wrap&&u(b.wrap)&&b.wrap.unbind(".fb");p.unbind(".fb");q.unbind(".fb")},bindEvents:function(){var a=b.current,d;a&&(q.bind("orientationchange.fb"+(t?"":" resize.fb")+(a.autoCenter&&!a.locked?" scroll.fb":""),b.update),(d=a.keys)&&p.bind("keydown.fb",function(e){var c=
e.which||e.keyCode,l=e.target||e.srcElement;if(27===c&&b.coming)return!1;e.ctrlKey||e.altKey||e.shiftKey||e.metaKey||l&&(l.type||f(l).is("[contenteditable]"))||f.each(d,function(d,l){if(1<a.group.length&&l[c]!==w)return b[d](l[c]),e.preventDefault(),!1;if(-1<f.inArray(c,l))return b[d](),e.preventDefault(),!1})}),f.fn.mousewheel&&a.mouseWheel&&b.wrap.bind("mousewheel.fb",function(d,c,l,g){for(var h=f(d.target||null),k=!1;h.length&&!(k||h.is(".fancybox-skin")||h.is(".fancybox-wrap"));)k=h[0]&&!(h[0].style.overflow&&
"hidden"===h[0].style.overflow)&&(h[0].clientWidth&&h[0].scrollWidth>h[0].clientWidth||h[0].clientHeight&&h[0].scrollHeight>h[0].clientHeight),h=f(h).parent();0!==c&&!k&&1<b.group.length&&!a.canShrink&&(0<g||0<l?b.prev(0<g?"down":"left"):(0>g||0>l)&&b.next(0>g?"up":"right"),d.preventDefault())}))},trigger:function(a,d){var e,c=d||b.coming||b.current;if(c){f.isFunction(c[a])&&(e=c[a].apply(c,Array.prototype.slice.call(arguments,1)));if(!1===e)return!1;c.helpers&&f.each(c.helpers,function(d,e){if(e&&
b.helpers[d]&&f.isFunction(b.helpers[d][a]))b.helpers[d][a](f.extend(!0,{},b.helpers[d].defaults,e),c)})}p.trigger(a)},isImage:function(a){return r(a)&&a.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i)},isSWF:function(a){return r(a)&&a.match(/\.(swf)((\?|#).*)?$/i)},_start:function(a){var d={},e,c;a=m(a);e=b.group[a]||null;if(!e)return!1;d=f.extend(!0,{},b.opts,e);e=d.margin;c=d.padding;"number"===f.type(e)&&(d.margin=[e,e,e,e]);"number"===f.type(c)&&(d.padding=[c,c,
c,c]);d.modal&&f.extend(!0,d,{closeBtn:!1,closeClick:!1,nextClick:!1,arrows:!1,mouseWheel:!1,keys:null,helpers:{overlay:{closeClick:!1}}});d.autoSize&&(d.autoWidth=d.autoHeight=!0);"auto"===d.width&&(d.autoWidth=!0);"auto"===d.height&&(d.autoHeight=!0);d.group=b.group;d.index=a;b.coming=d;if(!1===b.trigger("beforeLoad"))b.coming=null;else{c=d.type;e=d.href;if(!c)return b.coming=null,b.current&&b.router&&"jumpto"!==b.router?(b.current.index=a,b[b.router](b.direction)):!1;b.isActive=!0;if("image"===
c||"swf"===c)d.autoHeight=d.autoWidth=!1,d.scrolling="visible";"image"===c&&(d.aspectRatio=!0);"iframe"===c&&t&&(d.scrolling="scroll");d.wrap=f(d.tpl.wrap).addClass("fancybox-"+(t?"mobile":"desktop")+" fancybox-type-"+c+" fancybox-tmp "+d.wrapCSS).appendTo(d.parent||"body");f.extend(d,{skin:f(".fancybox-skin",d.wrap),outer:f(".fancybox-outer",d.wrap),inner:f(".fancybox-inner",d.wrap)});f.each(["Top","Right","Bottom","Left"],function(a,b){d.skin.css("padding"+b,x(d.padding[a]))});b.trigger("onReady");
if("inline"===c||"html"===c){if(!d.content||!d.content.length)return b._error("content")}else if(!e)return b._error("href");"image"===c?b._loadImage():"ajax"===c?b._loadAjax():"iframe"===c?b._loadIframe():b._afterLoad()}},_error:function(a){f.extend(b.coming,{type:"html",autoWidth:!0,autoHeight:!0,minWidth:0,minHeight:0,scrolling:"no",hasError:a,content:b.coming.tpl.error});b._afterLoad()},_loadImage:function(){var a=b.imgPreload=new Image;a.onload=function(){this.onload=this.onerror=null;b.coming.width=
this.width/b.opts.pixelRatio;b.coming.height=this.height/b.opts.pixelRatio;b._afterLoad()};a.onerror=function(){this.onload=this.onerror=null;b._error("image")};a.src=b.coming.href;!0!==a.complete&&b.showLoading()},_loadAjax:function(){var a=b.coming;b.showLoading();b.ajaxLoad=f.ajax(f.extend({},a.ajax,{url:a.href,error:function(a,e){b.coming&&"abort"!==e?b._error("ajax",a):b.hideLoading()},success:function(d,e){"success"===e&&(a.content=d,b._afterLoad())}}))},_loadIframe:function(){var a=b.coming,
d=f(a.tpl.iframe.replace(/\{rnd\}/g,(new Date).getTime())).attr("scrolling",t?"auto":a.iframe.scrolling).attr("src",a.href);f(a.wrap).bind("onReset",function(){try{f(this).find("iframe").hide().attr("src","//about:blank").end().empty()}catch(a){}});a.iframe.preload&&(b.showLoading(),d.one("load",function(){f(this).data("ready",1);t||f(this).bind("load.fb",b.update);f(this).parents(".fancybox-wrap").width("100%").removeClass("fancybox-tmp").show();b._afterLoad()}));a.content=d.appendTo(a.inner);a.iframe.preload||
b._afterLoad()},_preloadImages:function(){var a=b.group,d=b.current,e=a.length,c=d.preload?Math.min(d.preload,e-1):0,f,g;for(g=1;g<=c;g+=1)f=a[(d.index+g)%e],"image"===f.type&&f.href&&((new Image).src=f.href)},_afterLoad:function(){var a=b.coming,d=b.current,e,c,l,g,h;b.hideLoading();if(a&&!1!==b.isActive)if(!1===b.trigger("afterLoad",a,d))a.wrap.stop(!0).trigger("onReset").remove(),b.coming=null;else{d&&(b.trigger("beforeChange",d),d.wrap.stop(!0).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove());
b.unbindEvents();e=a.content;c=a.type;l=a.scrolling;f.extend(b,{wrap:a.wrap,skin:a.skin,outer:a.outer,inner:a.inner,current:a,previous:d});g=a.href;switch(c){case "inline":case "ajax":case "html":a.selector?e=f("<div>").html(e).find(a.selector):u(e)&&(e.data("fancybox-placeholder")||e.data("fancybox-placeholder",f('<div class="fancybox-placeholder"></div>').insertAfter(e).hide()),e=e.show().detach(),a.wrap.bind("onReset",function(){f(this).find(e).length&&e.hide().replaceAll(e.data("fancybox-placeholder")).data("fancybox-placeholder",
!1)}));break;case "image":e=a.tpl.image.replace(/\{href\}/g,g);break;case "swf":e='<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="'+g+'"></param>',h="",f.each(a.swf,function(a,b){e+='<param name="'+a+'" value="'+b+'"></param>';h+=" "+a+'="'+b+'"'}),e+='<embed src="'+g+'" type="application/x-shockwave-flash" width="100%" height="100%"'+h+"></embed></object>"}u(e)&&e.parent().is(a.inner)||a.inner.append(e);b.trigger("beforeShow");
a.inner.css("overflow","yes"===l?"scroll":"no"===l?"hidden":l);b._setDimension();b.reposition();b.isOpen=!1;b.coming=null;b.bindEvents();if(!b.isOpened)f(".fancybox-wrap").not(a.wrap).stop(!0).trigger("onReset").remove();else if(d.prevMethod)b.transitions[d.prevMethod]();b.transitions[b.isOpened?a.nextMethod:a.openMethod]();b._preloadImages()}},_setDimension:function(){var a=b.getViewport(),d=0,e=!1,c=!1,e=b.wrap,l=b.skin,g=b.inner,h=b.current,c=h.width,k=h.height,n=h.minWidth,v=h.minHeight,p=h.maxWidth,
q=h.maxHeight,t=h.scrolling,r=h.scrollOutside?h.scrollbarWidth:0,y=h.margin,z=m(y[1]+y[3]),s=m(y[0]+y[2]),w,A,u,D,B,G,C,E,I;e.add(l).add(g).width("auto").height("auto").removeClass("fancybox-tmp");y=m(l.outerWidth(!0)-l.width());w=m(l.outerHeight(!0)-l.height());A=z+y;u=s+w;D=F(c)?(a.w-A)*m(c)/100:c;B=F(k)?(a.h-u)*m(k)/100:k;if("iframe"===h.type){if(I=h.content,h.autoHeight&&1===I.data("ready"))try{I[0].contentWindow.document.location&&(g.width(D).height(9999),G=I.contents().find("body"),r&&G.css("overflow-x",
"hidden"),B=G.outerHeight(!0))}catch(H){}}else if(h.autoWidth||h.autoHeight)g.addClass("fancybox-tmp"),h.autoWidth||g.width(D),h.autoHeight||g.height(B),h.autoWidth&&(D=g.width()),h.autoHeight&&(B=g.height()),g.removeClass("fancybox-tmp");c=m(D);k=m(B);E=D/B;n=m(F(n)?m(n,"w")-A:n);p=m(F(p)?m(p,"w")-A:p);v=m(F(v)?m(v,"h")-u:v);q=m(F(q)?m(q,"h")-u:q);G=p;C=q;h.fitToView&&(p=Math.min(a.w-A,p),q=Math.min(a.h-u,q));A=a.w-z;s=a.h-s;h.aspectRatio?(c>p&&(c=p,k=m(c/E)),k>q&&(k=q,c=m(k*E)),c<n&&(c=n,k=m(c/
E)),k<v&&(k=v,c=m(k*E))):(c=Math.max(n,Math.min(c,p)),h.autoHeight&&"iframe"!==h.type&&(g.width(c),k=g.height()),k=Math.max(v,Math.min(k,q)));if(h.fitToView)if(g.width(c).height(k),e.width(c+y),a=e.width(),z=e.height(),h.aspectRatio)for(;(a>A||z>s)&&c>n&&k>v&&!(19<d++);)k=Math.max(v,Math.min(q,k-10)),c=m(k*E),c<n&&(c=n,k=m(c/E)),c>p&&(c=p,k=m(c/E)),g.width(c).height(k),e.width(c+y),a=e.width(),z=e.height();else c=Math.max(n,Math.min(c,c-(a-A))),k=Math.max(v,Math.min(k,k-(z-s)));r&&"auto"===t&&k<B&&
c+y+r<A&&(c+=r);g.width(c).height(k);e.width(c+y);a=e.width();z=e.height();e=(a>A||z>s)&&c>n&&k>v;c=h.aspectRatio?c<G&&k<C&&c<D&&k<B:(c<G||k<C)&&(c<D||k<B);f.extend(h,{dim:{width:x(a),height:x(z)},origWidth:D,origHeight:B,canShrink:e,canExpand:c,wPadding:y,hPadding:w,wrapSpace:z-l.outerHeight(!0),skinSpace:l.height()-k});!I&&h.autoHeight&&k>v&&k<q&&!c&&g.height("auto")},_getPosition:function(a){var d=b.current,e=b.getViewport(),c=d.margin,f=b.wrap.width()+c[1]+c[3],g=b.wrap.height()+c[0]+c[2],c={position:"absolute",
top:c[0],left:c[3]};d.autoCenter&&d.fixed&&!a&&g<=e.h&&f<=e.w?c.position="fixed":d.locked||(c.top+=e.y,c.left+=e.x);c.top=x(Math.max(c.top,c.top+(e.h-g)*d.topRatio));c.left=x(Math.max(c.left,c.left+(e.w-f)*d.leftRatio));return c},_afterZoomIn:function(){var a=b.current;a&&((b.isOpen=b.isOpened=!0,b.wrap.css("overflow","visible").addClass("fancybox-opened"),b.update(),(a.closeClick||a.nextClick&&1<b.group.length)&&b.inner.css("cursor","pointer").bind("click.fb",function(d){f(d.target).is("a")||f(d.target).parent().is("a")||
(d.preventDefault(),b[a.closeClick?"close":"next"]())}),a.closeBtn&&f(a.tpl.closeBtn).appendTo(b.skin).bind("click.fb",function(a){a.preventDefault();b.close()}),a.arrows&&1<b.group.length&&((a.loop||0<a.index)&&f(a.tpl.prev).appendTo(b.outer).bind("click.fb",b.prev),(a.loop||a.index<b.group.length-1)&&f(a.tpl.next).appendTo(b.outer).bind("click.fb",b.next)),b.trigger("afterShow"),a.loop||a.index!==a.group.length-1)?b.opts.autoPlay&&!b.player.isActive&&(b.opts.autoPlay=!1,b.play(!0)):b.play(!1))},
_afterZoomOut:function(a){a=a||b.current;f(".fancybox-wrap").trigger("onReset").remove();f.extend(b,{group:{},opts:{},router:!1,current:null,isActive:!1,isOpened:!1,isOpen:!1,isClosing:!1,wrap:null,skin:null,outer:null,inner:null});b.trigger("afterClose",a)}});b.transitions={getOrigPosition:function(){var a=b.current,d=a.element,e=a.orig,c={},f=50,g=50,h=a.hPadding,k=a.wPadding,n=b.getViewport();!e&&a.isDom&&d.is(":visible")&&(e=d.find("img:first"),e.length||(e=d));u(e)?(c=e.offset(),e.is("img")&&
(f=e.outerWidth(),g=e.outerHeight())):(c.top=n.y+(n.h-g)*a.topRatio,c.left=n.x+(n.w-f)*a.leftRatio);if("fixed"===b.wrap.css("position")||a.locked)c.top-=n.y,c.left-=n.x;return c={top:x(c.top-h*a.topRatio),left:x(c.left-k*a.leftRatio),width:x(f+k),height:x(g+h)}},step:function(a,d){var e,c,f=d.prop;c=b.current;var g=c.wrapSpace,h=c.skinSpace;if("width"===f||"height"===f)e=d.end===d.start?1:(a-d.start)/(d.end-d.start),b.isClosing&&(e=1-e),c="width"===f?c.wPadding:c.hPadding,c=a-c,b.skin[f](m("width"===
f?c:c-g*e)),b.inner[f](m("width"===f?c:c-g*e-h*e))},zoomIn:function(){var a=b.current,d=a.pos,e=a.openEffect,c="elastic"===e,l=f.extend({opacity:1},d);delete l.position;c?(d=this.getOrigPosition(),a.openOpacity&&(d.opacity=0.1)):"fade"===e&&(d.opacity=0.1);b.wrap.css(d).animate(l,{duration:"none"===e?0:a.openSpeed,easing:a.openEasing,step:c?this.step:null,complete:b._afterZoomIn})},zoomOut:function(){var a=b.current,d=a.closeEffect,e="elastic"===d,c={opacity:0.1};e&&(c=this.getOrigPosition(),a.closeOpacity&&
(c.opacity=0.1));b.wrap.animate(c,{duration:"none"===d?0:a.closeSpeed,easing:a.closeEasing,step:e?this.step:null,complete:b._afterZoomOut})},changeIn:function(){var a=b.current,d=a.nextEffect,e=a.pos,c={opacity:1},f=b.direction,g;e.opacity=0.1;"elastic"===d&&(g="down"===f||"up"===f?"top":"left","down"===f||"right"===f?(e[g]=x(m(e[g])-200),c[g]="+=200px"):(e[g]=x(m(e[g])+200),c[g]="-=200px"));"none"===d?b._afterZoomIn():b.wrap.css(e).animate(c,{duration:a.nextSpeed,easing:a.nextEasing,complete:b._afterZoomIn})},
changeOut:function(){var a=b.previous,d=a.prevEffect,e={opacity:0.1},c=b.direction;"elastic"===d&&(e["down"===c||"up"===c?"top":"left"]=("up"===c||"left"===c?"-":"+")+"=200px");a.wrap.animate(e,{duration:"none"===d?0:a.prevSpeed,easing:a.prevEasing,complete:function(){f(this).trigger("onReset").remove()}})}};b.helpers.overlay={defaults:{closeClick:!0,speedOut:200,showEarly:!0,css:{},locked:!t,fixed:!0},overlay:null,fixed:!1,el:f("html"),create:function(a){var d;a=f.extend({},this.defaults,a);this.overlay&&
this.close();d=b.coming?b.coming.parent:a.parent;this.overlay=f('<div class="fancybox-overlay"></div>').appendTo(d&&d.lenth?d:"body");this.fixed=!1;a.fixed&&b.defaults.fixed&&(this.overlay.addClass("fancybox-overlay-fixed"),this.fixed=!0)},open:function(a){var d=this;a=f.extend({},this.defaults,a);this.overlay?this.overlay.unbind(".overlay").width("auto").height("auto"):this.create(a);this.fixed||(q.bind("resize.overlay",f.proxy(this.update,this)),this.update());a.closeClick&&this.overlay.bind("click.overlay",
function(a){if(f(a.target).hasClass("fancybox-overlay"))return b.isActive?b.close():d.close(),!1});this.overlay.css(a.css).show()},close:function(){q.unbind("resize.overlay");this.el.hasClass("fancybox-lock")&&(f(".fancybox-margin").removeClass("fancybox-margin"),this.el.removeClass("fancybox-lock"),q.scrollTop(this.scrollV).scrollLeft(this.scrollH));f(".fancybox-overlay").remove().hide();f.extend(this,{overlay:null,fixed:!1})},update:function(){var a="100%",b;this.overlay.width(a).height("100%");
J?(b=Math.max(H.documentElement.offsetWidth,H.body.offsetWidth),p.width()>b&&(a=p.width())):p.width()>q.width()&&(a=p.width());this.overlay.width(a).height(p.height())},onReady:function(a,b){var e=this.overlay;f(".fancybox-overlay").stop(!0,!0);e||this.create(a);a.locked&&this.fixed&&b.fixed&&(b.locked=this.overlay.append(b.wrap),b.fixed=!1);!0===a.showEarly&&this.beforeShow.apply(this,arguments)},beforeShow:function(a,b){b.locked&&!this.el.hasClass("fancybox-lock")&&(!1!==this.fixPosition&&f("*").filter(function(){return"fixed"===
f(this).css("position")&&!f(this).hasClass("fancybox-overlay")&&!f(this).hasClass("fancybox-wrap")}).addClass("fancybox-margin"),this.el.addClass("fancybox-margin"),this.scrollV=q.scrollTop(),this.scrollH=q.scrollLeft(),this.el.addClass("fancybox-lock"),q.scrollTop(this.scrollV).scrollLeft(this.scrollH));this.open(a)},onUpdate:function(){this.fixed||this.update()},afterClose:function(a){this.overlay&&!b.coming&&this.overlay.fadeOut(a.speedOut,f.proxy(this.close,this))}};b.helpers.title={defaults:{type:"float",
position:"bottom"},beforeShow:function(a){var d=b.current,e=d.title,c=a.type;f.isFunction(e)&&(e=e.call(d.element,d));if(r(e)&&""!==f.trim(e)){d=f('<div class="fancybox-title fancybox-title-'+c+'-wrap">'+e+"</div>");switch(c){case "inside":c=b.skin;break;case "outside":c=b.wrap;break;case "over":c=b.inner;break;default:c=b.skin,d.appendTo("body"),J&&d.width(d.width()),d.wrapInner('<span class="child"></span>'),b.current.margin[2]+=Math.abs(m(d.css("margin-bottom")))}d["top"===a.position?"prependTo":
"appendTo"](c)}}};f.fn.fancybox=function(a){var d,e=f(this),c=this.selector||"",l=function(g){var h=f(this).blur(),k=d,l,m;g.ctrlKey||g.altKey||g.shiftKey||g.metaKey||h.is(".fancybox-wrap")||(l=a.groupAttr||"data-fancybox-group",m=h.attr(l),m||(l="rel",m=h.get(0)[l]),m&&""!==m&&"nofollow"!==m&&(h=c.length?f(c):e,h=h.filter("["+l+'="'+m+'"]'),k=h.index(this)),a.index=k,!1!==b.open(h,a)&&g.preventDefault())};a=a||{};d=a.index||0;c&&!1!==a.live?p.undelegate(c,"click.fb-start").delegate(c+":not('.fancybox-item, .fancybox-nav')",
"click.fb-start",l):e.unbind("click.fb-start").bind("click.fb-start",l);this.filter("[data-fancybox-start=1]").trigger("click");return this};p.ready(function(){var a,d;f.scrollbarWidth===w&&(f.scrollbarWidth=function(){var a=f('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"),b=a.children(),b=b.innerWidth()-b.height(99).innerWidth();a.remove();return b});f.support.fixedPosition===w&&(f.support.fixedPosition=function(){var a=f('<div style="position:fixed;top:20px;"></div>').appendTo("body"),
b=20===a[0].offsetTop||15===a[0].offsetTop;a.remove();return b}());f.extend(b.defaults,{scrollbarWidth:f.scrollbarWidth(),fixed:f.support.fixedPosition,parent:f("body")});a=f(s).width();K.addClass("fancybox-lock-test");d=f(s).width();K.removeClass("fancybox-lock-test");f("<style type='text/css'>.fancybox-margin{margin-right:"+(d-a)+"px;}</style>").appendTo("head")})})(window,document,jQuery);
var projectChartViewModel = function() {
    var self = this;
    this.category = ko.observable();
    this.defaultCategory = ko.observable();
    this.project = ko.observable();
    this.defaultProject = ko.observable();
    this.ganttChartData = ko.observable();
    this.taskChartData = ko.observable();
    this.magnifyingGlassLink = ko.observable();
    this.stockPhotoLink = ko.observable();
    this.stockPhotoDescription = ko.observable();
    this.stockPhotoLink_NotEmpty = ko.computed(function() {
        return typeof this.stockPhotoLink() !== "undefined" && this.stockPhotoLink() != null && this.stockPhotoLink() != "";
    }, this);

    this.category.subscribe(function(category) {
        FILTERS.projectFilter.update(null, category);
    });

    this.ganttChartData.subscribe(function(newText) {});

    this.taskChartData.subscribe(function(newText) {});

    this.project.subscribe(function(projectId) {
        if (typeof(projectId) !== "undefined")
            queryString.push('p', projectId);
        reportOfUnion.projectGanttChart_getDataAndDraw(function(data) { CHARTS.projectGanttChart.draw(null, data, true) }, projectId);
        reportOfUnion.taskGrid_getDataAndDraw(function(data) { CHARTS.tasksGrid.draw(null, data) }, projectId);
        reportOfUnion.riskGrid_getDataAndDraw(function(data) { CHARTS.riskGrid.draw(null, data) }, projectId);
        reportOfUnion.costProjectPieChart_getDataAndDraw(function(data) { CHARTS.costProjectPieChart.draw(null, data); }, projectId);
        reportOfUnion.costProjectBarChart_getDataAndDraw(function(data) { CHARTS.costProjectBarChart.draw(null, data); }, projectId);
        reportOfUnion.projectMagnifyingLink_getDataAndDraw(function(data) { self.magnifyingGlassLink(data.projectCostChartLink); }, projectId);
        reportOfUnion.stockPhotoLink_getDataAndDraw(function(data) {
            self.stockPhotoLink(data.stockPhotoLink);
            if (data.stockPhotoDescription != null && typeof data.stockPhotoDescription != "undefined" && data.stockPhotoDescription != "")
                self.stockPhotoDescription(data.stockPhotoDescription);
            else
                self.stockPhotoDescription("(no description)");
        }, projectId);
    });

    this.defaultProject.subscribe(function(projectId) {
        FILTERS.projectFilter.setValue(projectId);
    });
}