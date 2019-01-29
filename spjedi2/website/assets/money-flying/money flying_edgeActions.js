
(function($,Edge,compId){var Composition=Edge.Composition,Symbol=Edge.Symbol;
//Edge symbol: 'stage'
(function(symbolName){Symbol.bindTriggerAction(compId,symbolName,"Default Timeline",2000,function(sym,e){sym.play("a");});
//Edge binding end
})("stage");
//Edge symbol end:'stage'

//=========================================================

//Edge symbol: 'wings'
(function(symbolName){Symbol.bindTriggerAction(compId,symbolName,"Default Timeline",250,function(sym,e){sym.play("a");});
//Edge binding end
})("wings");
//Edge symbol end:'wings'
})(jQuery,AdobeEdge,"EDGE-3590327");