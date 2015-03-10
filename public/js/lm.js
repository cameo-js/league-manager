(function () {
  LM = {
    noti: {
      time: 2000 // ms
    },
    global: {
      context: ''
    }
  };
  
  LM.utils = {
    parseUrlHash : function() {
      var hashParams = {};
      var e,
          a = /\+/g,  // Regex for replacing addition symbol with a space
          r = /([^&;=]+)=?([^&;]*)/g,
          d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
          q = window.location.hash.substring(1);

      while (e = r.exec(q))
        hashParams[d(e[1])] = d(e[2]);

      return hashParams;
    }
    
  };

  LM.service = {
    context: function () {
      return LM.global.context
    },
    callDELETE: function (url_except_context, params, success, dataType, async) {
      if (!dataType) dataType = "json";
      if (typeof async === "undefined")
        async = true;

      return $.ajax({
        type: "DELETE",
        url: LM.service.context() + url_except_context,
        data: params,
        async: async,
        success: success,
        dataType: dataType
      });
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
  LM.api.players = {
    setTeam : function( playerId, teamId, success ){
      return LM.service.callPOST('/players/' + playerId , { teamId : teamId }, success );
    }
  };
  LM.api.matches = {
    reset : function( gameId, matchId, success ){
      return LM.service.callPOST('/games/' + gameId + '/matches/' + matchId + '/reset' , {}, success );
    },
    getRecentMatches : function( seasonId, gameId, success ){
      return LM.service.callGET('/matches/recent', { seasonId : seasonId, gameId : gameId }, success );
    }
    
  }
  LM.api.comments = {
    getMatchComments : function( matchId, success ){
      return LM.service.callGET('/comments/match', { matchId : matchId }, success );
    },
    getAll : function( success ){
      return LM.service.callGET('/comments', {}, success );
      
    },
    create: function( params, success ) {
      return LM.service.callPOST('/comments', params, success );
    },
    delete: function( commentId, success ){
      return LM.service.callDELETE('/comments', {commentId: commentId}, success );
    }
  }

})();