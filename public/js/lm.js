(function () {
  LM = {
    noti: {
      time: 2000 // ms
    },
    global: {
      context: ''
    }
  };

  LM.service = {
    context: function () {
      return LM.global.context
    },

    callPOST: function (url_except_context, params, success, dataType, async) {
      if (!dataType) dataType = "json";
      if (typeof async === "undefined")
        async = true;

      return $.ajax({
        type: "POST",
        url: LM.service.context() + url_except_context,
        data: params,
        async: async,
        success: success,
        dataType: dataType
      });
    },
    callGET: function (url_except_context, params, success, dataType, async) {
      if (!dataType) dataType = "json";
      if (typeof async === "undefined")
        async = true;

      return $.ajax({
        type: "GET",
        url: LM.service.context() + url_except_context,
        data: params,
        async: async,
        success: success,
        dataType: dataType
      });
    }
  };

  LM.api = {};
  LM.api.games = {
    getStandings : function ( seasonId, gameId, success) {
      return LM.service.callGET('/seasons/' + seasonId + '/games/' + gameId + '/standings', {}, success );
    },
    getMatchesAndSchedule : function( seasonId, gameId, success ){
      return LM.service.callGET('/seasons/' + seasonId + '/games/' + gameId + '/matches_and_schedule', {}, success );
    }
  };

})();