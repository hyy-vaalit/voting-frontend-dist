(function(){"use strict";angular.module("hyyVotingFrontendApp",["ngCookies","ngResource","ngRoute","ngSanitize","ngTouch","restangular","pascalprecht.translate","duScroll"]).constant("LOCALES",{locales:{fi:"Suomi",se:"Svenska",en:"English"},preferredLocale:"fi"}).constant("DEBUG_MODE",!0).config(["$translateProvider","DEBUG_MODE","LOCALES",function(a,b,c){return a.useStaticFilesLoader({prefix:"resources/locale-",suffix:".json"}),a.preferredLanguage(c.preferredLocale),a.useMissingTranslationHandler("missingTranslationHandler"),a.useSanitizeValueStrategy("sanitize"),a.useLocalStorage()}]).config(["$routeProvider",function(a){return a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/sign-up",{templateUrl:"views/sign-up.html",controller:"SignUpCtrl",controllerAs:"session"}).when("/sign-in",{templateUrl:"views/sign-in.html",controller:"SignInCtrl",controllerAs:"session"}).when("/sign-in-error",{templateUrl:"views/sign-in-error.html",controller:"SignInErrorCtrl",controllerAs:"signInError"}).when("/sign-out",{templateUrl:"views/sign-out.html",controller:"SignOutCtrl",controllerAs:"signOut"}).when("/vote",{templateUrl:"views/vote.html",controller:"VoteCtrl",controllerAs:"vote"}).when("/elections",{templateUrl:"views/elections.html",controller:"ElectionsCtrl",controllerAs:"elections"}).when("/profile",{templateUrl:"views/profile.html",controller:"ProfileCtrl",controllerAs:"profile"}).otherwise({redirectTo:"/"})}])}).call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("MainCtrl",["Environment",function(a){this.isSignInActive=a.isSignInActive(),this.isElectionActive=a.isElectionActive(),this.isEligibilityActive=a.isEligibilityActive(),this.hasElectionStarted=a.hasElectionStarted(),this.hasElectionTerminated=a.hasElectionTerminated(),this.hasSignInEnded=a.hasSignInEnded(),this.eligibilitySignInStartsAt=a.eligibilitySignInStartsAt,this.electionSignInStartsAt=a.electionSignInStartsAt,this.dailyOpeningTime=a.dailyOpeningTime,this.dailyClosingTime=a.dailyClosingTime}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("VoteCtrl",["$scope","$location","candidates","coalitions","VoteSrv","errorMonitor",function(a,b,c,d,e,f){this.debug=!1,this.electionId=b.search().election,this.loadError=!1,this.loading=!0,this.selected=null,this.submitting=this.submitted=!1,this.coalitions=[],this.candidates=[],this.savedVote=null,this.votingRight=null,Promise.all([d.get(this.electionId),c.get(this.electionId),e.getVotingRight(this.electionId)]).then(function(a){return function(b){return a.coalitions=b[0],a.candidates=b[1],a.votingRight=b[2]}}(this),function(a){return function(b){return a.loadError=!0,f.error(b,"Fetching coalitions/candidates failed")}}(this)).finally(function(b){return function(){return b.loading=!1,a.$apply()}}(this)),this.isProspectSelected=function(){return null!==this.selected},this.select=function(a){if(!(this.submitting||this.submitted||this.votingRight.used))return this.selected=a.id},this.isUnsaved=function(){return!(!this.selected||!this.savedVote||_.isEmpty(this.savedVote))&&this.selected!==this.savedVote.candidate_id},this.submit=function(a){return this.submitting=!0,e.submit(this.electionId,a).then(function(a){return function(b){return a.votingRight=b}}(this),function(a){return function(b){return a.submitError=!0,f.error(b,"Vote failed"),a.votingRight=b.data.error.voting_right}}(this)).catch(function(a){return function(b){return a.submitError=!0,f.error(b,"Vote failed for unknown error.")}}(this)).finally(function(a){return function(){return a.submitted=!0,a.submitting=!1}}(this))}}]).filter("candidate",function(){return function(a,b){if((null!=a?a.name:void 0)===(null!=b?b.name:void 0)&&(void 0!==a&&null!==a?a.number:void 0)===(null!=b?b.number:void 0))return a}}).directive("voteProspect",function(){return{restrict:"E",template:"<span translate>.vote-ballot.header-number</span>: <strong>{{ prospect.number }}</strong>\n<br>\n<span translate>.vote-ballot.header-name</span>: <strong>{{ prospect.name }}</strong>",scope:{selected:"=vtSelected",all:"=vtAll"},link:function(a,b,c){return a.$watch("selected",function(b,c){return a.prospect=_.find(a.all,"id",b)})}}})}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("SignUpCtrl",["Environment","SessionSrv","$scope","$location","errorMonitor",function(a,b,c,d,e){this.loading=!1,this.submitted=!1,this.error=null,this.email=null,this.allowLinkRequest=!1,this.isSignInActive=a.isSignInActive(),this.requestLink=function(a){return this.loading=!0,b.requestLink(a).then(function(a){return function(b){return a.submitted=!0}}(this),function(a){return function(b){var c;return console.error("Failed requesting link",b),a.error=b,(null!=(c=a.error.data)?c.key:void 0)?a.error.translation_key=a.error.data.key:a.error.is_unknown=!0}}(this)).catch(function(a){return function(b){return e.error(b,"Requesting session link failed"),a.error=b}}(this)).finally(function(a){return function(){return a.loading=!1}}(this))}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").service("SessionSrv",["$window","Restangular","elections",function(a,b,c){this.requestLink=function(a){return b.all("sessions").all("link").post({email:a})},this.signIn=function(a){return b.all("sessions").post({token:a}).then(function(a){return function(b){return a.save(b)}}(this))},this.signOut=function(){return new Promise(function(b,c){return b(a.sessionStorage.clear())})},this.getJwt=function(){return a.sessionStorage.getItem("jwt")},this.getUser=function(){var b;try{return JSON.parse(a.sessionStorage.getItem("user"))}catch(a){return b=a,console.log("Could not get current user",b),{}}},this.getVoter=function(){var b;try{return JSON.parse(a.sessionStorage.getItem("voter"))}catch(a){return b=a,console.error("Could not get current voter",b),null}},this.save=function(b){return new Promise(function(d,e){var f;return a.sessionStorage.setItem("jwt",b.jwt),a.sessionStorage.setItem("user",JSON.stringify(b.user)),a.sessionStorage.setItem("voter",JSON.stringify(b.voter)),b.elections?(c.save(b.elections),f="elections"):f="eligibility",d({type:f})})}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("SignInCtrl",["$location","$window","SessionSrv","errorMonitor",function(a,b,c,d){this.loading=!0,this.token=a.search().token,this.error=!1,this.invalidToken=!1,this.privateBrowsingModeError=!1,this.redirectAccordingTo=function(b){return"elections"===b.type?a.path("/elections"):"eligibility"===b.type?a.path("/profile"):(this.error=!0,this.invalidToken=!0,d.error("Unknown session type: "+b.type))},c.signIn(this.token).then(function(b){return function(c){return a.search("token",null),b.redirectAccordingTo(c)}}(this),function(a){return function(b){return a.error=!0,22===b.code&&"QuotaExceededError"===b.name?(console.error("private browsing mode :/"),a.privateBrowsingModeError=!0):403!==b.status?(d.error(b,"Sign in failed for other reason than HTTP 403"),a.invalidToken=!0):a.invalidToken=!0,console.error("Sign in failed: ",b)}}(this)).finally(function(a){return function(){return a.loading=!1}}(this))}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").factory("alliances",["SessionRestangular",function(a){return{get:function(b){return a.one("elections",b).all("alliances").getList()}}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").factory("coalitions",["SessionRestangular",function(a){return{get:function(b){return a.one("elections",b).all("coalitions").getList({with_candidates:!0})}}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").factory("candidates",["SessionRestangular","elections",function(a,b){return{get:function(b){return a.one("elections",b).all("candidates").getList()}}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").run(["Restangular","Environment",function(a,b){return a.setBaseUrl(b.apiBaseUrl)}]).config(["RestangularProvider",function(a){return a.setDefaultHttpFields({timeout:25e3})}]).service("SessionRestangular",["Restangular","SessionSrv",function(a,b){return a.withConfig(function(a){return a.setDefaultHeaders({Authorization:"Bearer "+b.getJwt()})})}]).service("UnauthenticatedRestangular",["Restangular",function(a){return a}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").directive("setClassWhenAtTop",["$window",function(a){var b;return b=angular.element(a),{restrict:"A",link:function(a,c,d){var e,f,g,h;return g=d.setClassWhenAtTop,h=parseInt(d.paddingWhenAtTop,10),f=c.parent(),e=null,b.on("scroll",function(){return e=f.offset().top-h,b.scrollTop()>=e?(c.addClass(g),f.height(c.height())):(c.removeClass(g),f.css("height",null))})}}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").service("VoteSrv",["SessionRestangular",function(a){this.submit=function(b,c){return a.one("elections",b).all("vote").post({candidate_id:c})},this.all=function(){return new Promise(function(a,b){return a({})})},this.getVotingRight=function(b){return a.one("elections",b).one("voting_right").get()},this.getPreviousVote=function(a){return new Promise(function(a,b){return a({})})}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("ElectionsCtrl",["$scope","elections","VoteSrv","errorMonitor","Environment",function(a,b,c,d,e){this.all=null,this.votes=null,this.loading=!0,this.loadError=!1,this.isElectionActive=e.isElectionActive(),this.init=function(){return this.isElectionActive?this.loadElections():this.loading=!1},this.loadElections=function(){return Promise.all([b.get()]).then(function(a){return function(b){return a.all=b[0]}}(this),function(a){return function(b){return a.loadError=b}}(this)).finally(function(b){return function(){return b.loading=!1,a.$apply()}}(this))},this.init()}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").factory("elections",["$window",function(a){return{save:function(b){return a.sessionStorage.setItem("elections",JSON.stringify(b))},get:function(){return new Promise(function(b,c){var d;return d=a.sessionStorage.getItem("elections"),d?b(JSON.parse(d)):c("No elections available")})}}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").directive("vtVoteStatus",["$sce",function(a){return{restrict:"EA",scope:{votes:"=vtVoteStatusVotes",election:"=vtVoteStatusElection"},link:function(a,b,c){if(null!=_.find(a.votes,"election_id",a.election.id))return b.text("X")}}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").factory("errorMonitor",["SessionSrv",function(a){return{error:function(b,c){return null==c&&(c=""),Rollbar.error(b,{msg:c,user:a.getUser()}),console.error("Reported unexpected error to Rollbar:",b,c,a.getUser())},warning:function(b,c){return null==c&&(c=""),Rollbar.warn(b,{msg:c,user:a.getUser()}),console.warn("Reported warning to Rollbar:",b,c,a.getUser())}}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").service("Environment",function(){this.apiBaseUrl=function(){return _VAALIT.api.baseUrl}(),this.eligibilitySignInStartsAt=function(){return moment.tz(_VAALIT.eligibility.signIn.startsAt,"YYYY-MM-DD HH:mm","Europe/Helsinki")}(),this.eligibilitySignInEndsAt=function(){return moment.tz(_VAALIT.eligibility.signIn.endsAt,"YYYY-MM-DD HH:mm","Europe/Helsinki")}(),this.dailyOpeningTime=function(){return moment.tz(_VAALIT.voting.signIn.dailyOpeningTime,"HH:mm","Europe/Helsinki")}(),this.dailyClosingTime=function(){return moment.tz(_VAALIT.voting.signIn.dailyClosingTime,"HH:mm","Europe/Helsinki")}(),this.electionSignInStartsAt=function(){return moment.tz(_VAALIT.voting.signIn.startsAt,"YYYY-MM-DD HH:mm","Europe/Helsinki")}(),this.electionSignInEndsAt=function(){return moment.tz(_VAALIT.voting.signIn.endsAt,"YYYY-MM-DD HH:mm","Europe/Helsinki")}(),this.electionTerminatesAt=function(){return moment.tz(_VAALIT.voting.signIn.terminatesAt,"YYYY-MM-DD HH:mm","Europe/Helsinki")}(),this.isEligibilityActive=function(){return moment().isAfter(this.eligibilitySignInStartsAt)&&moment().isBefore(this.eligibilitySignInEndsAt)},this.isElectionActive=function(){return moment().isAfter(this.electionSignInStartsAt)&&moment().isBefore(this.electionSignInEndsAt)},this.isSignInActive=function(){return this.isElectionActive()&&moment().isAfter(this.dailyOpeningTime)&&moment().isBefore(this.dailyClosingTime)},this.hasElectionStarted=function(){return moment().isAfter(this.electionSignInStartsAt)},this.hasElectionTerminated=function(){return moment().isAfter(this.electionTerminatesAt)},this.hasSignInEnded=function(){return moment().isAfter(this.electionSignInEndsAt)}})}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("ProfileCtrl",["$location","SessionSrv",function(a,b){this.voter=b.getVoter(),this.redirect=function(){return a.path("/sign-up")},this.voter||this.redirect()}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("SignOutCtrl",["SessionSrv",function(a){this.cleared=!1,a.signOut().then(function(a){return function(){return a.cleared=!0}}(this))}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").directive("vtTranslateLanguageSelect",["LocaleSrv",function(a){return{restrict:"AE",replace:!0,template:'<div class="btn-group language-select">\n  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n    <span ng-bind="currentLocaleName"></span> <span class="caret"></span>\n  </button>\n  <ul class="dropdown-menu">\n    <li ng-repeat="name in localeNames">\n      <a ng-click="changeLanguage(name)" ng-bind="name"></a>\n    </li>\n  </ul>\n</div>',controller:["$scope",function(b){var c;return b.currentLocaleName=a.getCurrentLocaleName(),b.localeNames=a.getLocaleNames(),b.localeKeys=a.getLocaleKeys(),b.visible=(null!=(c=b.localeNames)?c.length:void 0)>1,b.changeLanguage=function(c){return a.setLocaleByDisplayName(c),b.currentLocaleName=c}}]}}])}.call(this),function(){"use strict";var a;a=$("body, html"),angular.module("hyyVotingFrontendApp").directive("vtConfirmClick",function(){return{priority:-1,restrict:"A",scope:{isConfirmVisible:"=vtConfirmClick"},link:function(b,c,d){var e,f;return b.isConfirmVisible=!1,f=function(){return b.isConfirmVisible=!1,b.$apply()},e=function(){return c.off("click.onConfirm"),b.isConfirmVisible=!1,b.$apply()},c.on("click.triggerConfirm",function(d){return!b.isConfirmVisible&&(b.isConfirmVisible=!0,b.$apply(),a.off("click.onBodyClick"),d.stopImmediatePropagation(),d.preventDefault(),a.one("click.onBodyClick",e),c.one("click.onConfirm",f))})}}})}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").service("LocaleSrv",["$translate","LOCALES",function(a,b){this.findKeyByValue=function(a){var c,d;d=b.locales;for(c in d)if(d[c]===a)return c},this.getLocaleNames=function(){return _.values(b.locales)},this.getLocaleKeys=function(){return _.keys(b.locales)},this.getCurrentLocaleName=function(){return b.locales[a.proposedLanguage()]},this.setLocaleByDisplayName=function(b){return a.use(this.findKeyByValue(b))}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").factory("missingTranslationHandler",["$translate","errorMonitor",function(a,b){return function(a,c){return b.warning("Missing translation key: '"+a+"' (lang: '"+c+"')"),"MISSING: '"+a+"'"}}])}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").filter("moment",function(){return function(a,b){return moment(a).format(b)}})}.call(this),function(){"use strict";angular.module("hyyVotingFrontendApp").controller("SignInErrorCtrl",["$location",function(a){switch(this.failure=a.search().failure,this.noVotingRight=null,this.invalidSamlResponse=null,this.general=null,this.failure){case"no_voting_right":this.noVotingRight=!0;break;case"invalid_saml_response":this.invalidSamlResponse=!0;break;default:console.debug("Unknown failure:",this.failure),this.general=!0}}])}.call(this),angular.module("hyyVotingFrontendApp").run(["$templateCache",function(a){"use strict";a.put("views/_contact.html",'\x3c!-- N.B. This embeddable view is agnostic of the Bootstrap grid --\x3e <div translate-namespace="partials.contact"> <h4 translate>.more_info</h4> <ul> <li> <a href="http://hyy.fi/vaalit" translate>.hyy_election_link_caption</a> </li> <li> <span translate>.in_case_of_fire</span> <a href="mailto:vaalit@hyy.fi">vaalit@hyy.fi</a> </li> <li> \x3c!-- #NOTE: Contact information --\x3e Teemu Palkki +358 50 449 7950 </li> </ul> </div>'),a.put("views/_info.html",'<div class="col-xs-12 col-sm-6" translate-namespace="partials.info"> <h4 translate>.main_title</h4> <p translate=".ingress"></p> <p> \x3c!-- #NOTE: Date --\x3e <span translate translate-values="{ firstPeriod: \'28.-30.10.\', secondPeriod: \'2.11.-4.11.2020\', range: \'9-18\' }"> .election_dates_explained </span> </p> </div> <div class="col-xs-12 col-sm-6" ng-include src="\'views/_contact.html\'"></div>'),a.put("views/elections.html",'<div class="page-header"> <h1 translate> pages.elections.page_title </h1> </div> <div class="row"> <div class="col-xs-12"> <div ng-if="elections.loading" translate> common.loading </div> </div> </div> <div class="jumbotron alert alert-info" ng-if="elections.loadError" translate-namespace="pages.elections"> <div class="container"> <h1 translate>.sign_in</h1> <p class="lead" translate> .sign_up_please </p> <a ng-href="#/sign-up" class="btn btn-primary" translate> .sign_up_button_caption </a> </div> </div> <div ng-if="!elections.isElectionActive" class="row" translate-namespace="pages.elections.not_started"> <div class="col-xs-12"> <p translate> .voting_has_not_started_yet </p> </div> </div> <div class="row" ng-if="elections.all.length == 0" translate-namespace="pages.elections.empty"> <div class="col-xs-12"> <p translate> .no_elections_available </p> </div> </div> <div ng-if="!elections.loadError && !elections.loading && elections.isElectionActive && elections.all.length > 0" class="row" translate-namespace="pages.elections"> <div class="col-xs-12"> \x3c!--#TODO:halloped\n    <p translate>\n      .you_can_vote_in_the_following\n    </p>\n    --\x3e <p> <span translate>.choose_election</span> <span translate>.vote_is_immutable</span> </p> <table class="table table-striped table-hover"> <thead> <th translate>.table_header.election_name</th> \x3c!--#TODO:Halloped <th translate>.table_header.status</th> --\x3e </thead> <tbody> <tr ng-repeat="election in elections.all"> <td> <a ng-href="#/vote?election={{ election.id }}">{{ election.name }}</a> </td> \x3c!--\n          <td>\n            <#TODO:halloped Mark elections where user has already voted in\n              vt-vote-status\n              vt-vote-status-votes="elections.voting_right"\n              vt-vote-status-election="election"></vt-vote-status>\n          </td>\n          --\x3e </tr> </tbody> </table> <p translate> .submit_vote_help </p> </div> </div>'),a.put("views/main.html",'<div class="jumbotron" translate-namespace="pages.main"> <div> <h1 translate>.page_title</h1> <p class="lead"> <img src="images/logo/hyy-seppele.png" style="margin: 1.5em; height: 150px" alt="HYYn logo"><br> </p> <p class="lead" translate ng-if="main.isEligibilityActive"> .you_may_check_eligibility \x3c!--  eng. the right to vote and to stand as candidate --\x3e \x3c!-- #TODO: päivämäärä --\x3e </p> <div ng-if="main.hasElectionTerminated"> <p class="lead" translate> .voting_has_ended </p> <p> <span translate>.result_will_be_published_at</span> <a href="http://vaalitulos.hyy.fi">vaalitulos.hyy.fi</a>. </p> </div> \x3c!-- Voting has not started  --\x3e <div ng-if="!main.hasElectionStarted"> <p class="lead"> \x3c!--#TODO:Halloped Vaalikelpoisuuden tarkistaminen\n        <span translate>.eligibility_check</span>\n        <strong>{{ main.eligibilitySignInStartsAt | moment:\'DD.MM.YYYY HH:mm\' }}</strong>\n        --\x3e <span translate>.voting_opens_at</span> <strong>{{ main.electionSignInStartsAt | moment:\'DD.MM.YYYY HH:mm\' }}</strong> </p> </div> \x3c!-- Voting has started but time is outside opening hours --\x3e <div ng-if="main.hasElectionStarted && !main.isSignInActive && !main.hasSignInEnded"> <p class="lead"> <span translate translate-values="{ open: main.dailyOpeningTime.format(\'HH:mm\'), close: main.dailyClosingTime.format(\'HH:mm\') }"> .voting_opening_hours </span> </p> </div> \x3c!-- Current voting period has already ended, but election will continue eg. next week. --\x3e <div ng-if="main.hasElectionStarted && main.hasSignInEnded && !main.hasElectionTerminated"> <p class="lead" translate translate-values="{ day: \'31.10.\', time: \'10\' }"> .voting_continues_at </p> </div> <div ng-if="main.isSignInActive"> <p class="lead" translate> .sign_in_using_university_account </p> <p> <a class="btn btn-lg btn-success" ng-href="/haka/auth/new"> \x3c!--#TODO:Halloped Vaalikelpoisuuden tarkistaminen\n          <span ng-if="main.isEligibilityActive" translate>\n            .button_caption_eligibility\n          </span>\n          --\x3e <span ng-if="main.isElectionActive" translate> .button_caption_vote </span> <span class="glyphicon glyphicon-ok"></span> </a> </p> </div> </div> </div> <div class="row" ng-include="\'views/_info.html\'"></div>'),a.put("views/profile.html",'<div class="page-header"> <h1 translate>pages.profile.page_title</h1> </div> <div class="row" translate-namespace="pages.profile"> <div class="col-xs-12"> <p translate> .ingress </p> <dl class="dl-horizontal"> <dt translate>.voter.name</dt> <dd ng-bind="profile.voter.name"></dd> <dt translate>.voter.email</dt> <dd ng-bind="profile.voter.email"></dd> <dt translate>.voter.phone</dt> <dd ng-bind="profile.voter.phone"></dd> <dt translate>.voter.faculty</dt> <dd ng-bind-template="{{ profile.voter.faculty.name }} ({{ profile.voter.faculty.code }})"></dd> <dt translate>.voter.department</dt> <dd ng-bind-template="{{ profile.voter.department.name }} ({{ profile.voter.department.code }})"></dd> </dl> <p translate> .in_case_of_problem </p> </div> </div> <div class="row"> <div class="col-xs-12 col-sm-6" ng-include src="\'views/_contact.html\'"></div> </div> '),a.put("views/sign-in-error.html",'<div class="row" translate-namespace="pages.sign_in_error"> <div class="col-xs-12"> <div class="jumbotron alert alert-danger"> <div class="container"> <div ng-if="signInError.noVotingRight" translate-namespace=".no_voting_right"> <h1 translate>.title</h1> <p class="lead" translate>.lead</p> <p translate>.body</p> <p> <a translate ng-href="#/" class="btn btn-primary"> .button_caption </a> </p> </div> <div ng-if="signInError.invalidSamlResponse" translate-namespace=".invalid_saml_response"> <h1 translate>.title</h1> <p class="lead" translate>.lead</p> <p translate>.body</p> <p> <a translate ng-href="#/" class="btn btn-primary"> .button_caption </a> </p> </div> <div ng-if="signInError.general" translate-namespace=".general"> <h1 translate>.title</h1> <p class="lead" translate>.lead</p> <p translate>.body</p> <p> <a translate ng-href="#/" class="btn btn-primary"> .button_caption </a> </p> </div> </div> </div> \x3c!-- jumbotron alert --\x3e </div> \x3c!-- col --\x3e </div> \x3c!-- row --\x3e'),a.put("views/sign-in.html",'\x3c!-- This page is only presented on an error. User is redirected on success. --\x3e <div class="row" translate-namespace="pages.sign_in"> <div class="col-xs-12"> <div ng-if="session.loading" translate> .loading </div> <div ng-if="!session.loading"> <div ng-if="session.error"> <div class="jumbotron alert alert-danger"> <div ng-if="session.invalidToken"> <div class="container"> <h1 translate>.error.title_invalid_key</h1> <p class="lead" translate> .error.lead </p> <p> <a translate ng-href="#/sign-up" class="btn btn-primary"> .error.request_new_link </a> </p> </div> </div> <div ng-if="session.privateBrowsingModeError"> <div class="container"> <h1 translate>.error.private_browsing_mode.title</h1> <p class="lead" translate> .error.private_browsing_mode.lead </p> <p translate> .error.private_browsing_mode.what_now </p> </div> </div> </div> </div> </div> </div> \x3c!-- col --\x3e </div> \x3c!-- row --\x3e'),a.put("views/sign-out.html",'<div class="page-header"> <h1 translate>pages.sign_out.page_title</h1> </div> <div class="row" translate-namespace="pages.sign_out"> <div class="col-xs-12 col-sm-8"> <p ng-if="signOut.cleared" translate> .ingress </p> </div> </div>'),a.put("views/sign-up.html",'<div class="page-header"> <h1 translate>pages.sign_up.page_title</h1> </div> <div class="row" translate-namespace="pages.sign_up"> \x3c!-- HAKA AUTHENTICATION --\x3e <div ng-if="!session.allowLinkRequest" class="col-xs-12"> <p translate> .edari.eligibility </p> <p translate> .edari.late_member_note </p> \x3c!-- #NOTE: Contact information --\x3e <p translate translate-values="{ name: \'Teemu Palkki\', email: \'vaalit@hyy.fi\', phone: \'+358 50 449 7950\'}"> .if_cannot_sign_in </p> <p> <strong translate>.attention</strong> \x3c!-- #NOTE: Voting days --\x3e <li translate translate-values="{ firstPeriod: \'28.10.-30.10.\', secondPeriod: \'2.-4.11.2020\' }"> .voting_days_are </li> \x3c!-- #NOTE: Voting hours --\x3e <li translate translate-values="{ range: \'9-18\' }"> .voting_open_hours_are </li> </p> <hr> <a ng-show="session.isSignInActive" href="/haka/auth/new" class="btn btn-lg btn-primary btn-block" translate> .primary_button_caption </a> <p ng-hide="session.isSignInActive" translate> .sign_in_is_not_active </p> </div> \x3c!-- HAKA AUTHENTICATION --\x3e \x3c!-- REQUEST SIGN IN LINK --\x3e <div ng-if="session.allowLinkRequest" translate-namespace=".request_link" class="col-xs-12"> <p translate> .ingress </p> <p translate> .password_instructions </p> <p> <span translate>.spam_instructions</span> <span translate>.in_case_of_fire</span> \x3c!-- #TODO: yhteystiedot --\x3e </p> <p> <strong translate>.attention</strong> \x3c!-- #TODO: vaalipäivät --\x3e <li translate>.election_dates_explained</li> <li translate>.staff_eligibility_note</li> </p> <form class="form-horizontal css-form" name="request"> <div class="form-group"> <label for="email" class="col-sm-2 control-label" translate=".input_caption_email"> </label> <div class="col-sm-10"> <div class="input-group"> <span class="input-group-addon">@</span> <input type="email" class="form-control" placeholder="firstname.lastname@helsinki.fi" required ng-disabled="session.loading || session.submitted" ng-model="session.email"> </div> </div> </div> <div class="form-group"> <div class="col-sm-offset-2 col-sm-10"> <button type="submit" class="btn btn-default btn-primary" ng-disabled="request.$invalid || session.loading" ng-hide="session.submitted || session.error" ng-click="session.requestLink(session.email)"> <div ng-show="session.loading"> <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> <span translate=".button_caption_submitting"></span> </div> <span ng-hide="session.loading" translate> .button_caption_submit </span> </button> <div ng-show="session.submitted"> <p translate> .link_has_been_sent </p> <p translate> .pls_check_email </p> </div> <div class="alert alert-danger" ng-show="session.error"> <p> <strong translate>.something_went_wrong.detail</strong> </p> <p ng-if="!session.error.is_unknown"> <span translate="{{session.error.translation_key}}" translate-namespace=".errors"></span> </p> <p translate> .something_went_wrong.if_happens_again </p> <div ng-if="session.error.is_unknown"> <p> <hr> <span translate> .something_went_wrong.pls_explain </span> <br> Status: <span ng-bind="session.error.status"></span> <br> Data: <span ng-bind="session.error.data | json"></span> </p> </div> </div> </div> </div> </form> </div> \x3c!-- REQUEST SIGN IN LINK --\x3e </div> \x3c!-- row --\x3e'),
a.put("views/vote.html",'\x3c!-- PAGE HEADER --\x3e <div class="page-header"> <h1 translate> pages.vote.page_title </h1> </div> \x3c!-- SOMETHING WENT WRONG --\x3e <div class="jumbotron alert alert-danger" ng-if="vote.loadError" translate-namespace="pages.vote.error"> <div class="container"> <h1 translate> .something_went_wrong </h1> <p translate> .could_not_load_candidates </p> <p translate> .try_again </p> <a ng-href="#/sign-up" class="btn btn-primary" translate> .button_caption </a> </div> </div> \x3c!-- MAIN CONTENT --\x3e <div class="row" translate-namespace="pages.vote"> <div class="col-xs-12"> <form novalidate ng-hide="vote.loadError"> <div> \x3c!-- required container for set-class-when-at-top --\x3e <div class="panel panel-primary vote-ballot" set-class-when-at-top="fix-to-top" padding-when-at-top="10"> \x3c!-- N.B. padding-when-at-top must match the fixed position px,\n               which is defined by `top` in .fix-to-top class.\n               Otherwise a jumpy side-effect will occurr when scrolling down.\n          --\x3e <div class="panel-heading"> <h3 class="panel-title" translate>.vote-ballot.title</h3> </div> <div class="panel-body"> \x3c!--\n            Display an initial help text for a new voter who has not yet\n            selected a candidate.\n            --\x3e <div ng-hide="vote.isProspectSelected()"> <p translate> .vote-ballot.ingress </p> <p translate> .vote-ballot.registration-note </p> </div> \x3c!-- Display candidate which is selected from the list --\x3e <vote-prospect ng-show="vote.isProspectSelected()" vt-selected="vote.selected" vt-all="vote.candidates"> </vote-prospect> \x3c!--\n            Displayed when a vote can be changed,\n            user has previously submitted a vote,\n            he has now reloaded the voting page,\n            and he has selected a new candidate from the list.\n            --\x3e <div ng-if="vote.isUnsaved()" class="alert alert-warning"> <p translate> .vote-ballot.about-to-change-existing-vote </p> </div> </div> <div class="panel-footer"> \x3c!--\n            Primary action button: cast a new vote.\n\n            Note: If button type is "submit", then pressing enter when the\n                  the search field has focus (and a candidate is selected)\n                  will submit the form. Having type="button" will prevent this.\n            --\x3e <button class="btn btn-primary" type="button" vt-confirm-click="isVoteConfirmVisible" ng-click="vote.submit(vote.selected)" ng-disabled="!vote.isProspectSelected() || vote.submitting || vote.submitted" ng-hide="vote.submitted || vote.votingRight.used"> <span ng-show="vote.submitting && !vote.submitted"> <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> <span translate>.vote-ballot.submitting</span> </span> <span ng-hide="vote.submitting || vote.submitted || vote.submitError || isVoteConfirmVisible" translate> .vote-ballot.button-submit-caption </span> <span ng-show="isVoteConfirmVisible" translate> .vote-ballot.button-submit-confirm </span> </button> \x3c!--\n            Notification of a successfully cast new vote.\n            --\x3e <div class="alert alert-success" role="alert" ng-if="vote.submitted && !vote.submitError"> <p> <strong translate>.vote-has-been-cast</strong> </p> \x3c!--\n              Halloped: If you are have voting right in multiple elections,\n                        choose next election.\n              --\x3e \x3c!--\n              <p>\n                <span translate>.if-you-are-eligible-in-others</span>\n                <a ng-href="#/elections" translate>.choose-next-election</a>.\n              </p>\n              --\x3e <p translate> .close-window-when-finished </p> </div> \x3c!--\n            Notification of a failed casting of vote.\n\n            #TODO:translate\n            --\x3e <div class="alert alert-danger" role="alert" ng-if="vote.submitError"> <strong>Äänestäminen epäonnistui!</strong> <p> Lataa äänestyssivu uudelleen selaimen refresh-toiminnolla ja yritä äänestää uudelleen. </p> <p> Jos ongelma toistuu, ota yhteys HYYn vaalikoordinaattoriin vaalit@hyy.fi </p> </div> \x3c!--\n            Notification of an already used voting right.\n            --\x3e <div ng-if="!vote.submitted && vote.votingRight.used" class="alert alert-warning"> <p> <span translate>.voting-right-already-used</span> {{ vote.votingRight.updated_at | moment:\'DD.MM.YYYY HH:mm\' }}. </p> </div> </div> </div> </div> \x3c!-- LOADING INDICATOR --\x3e <div ng-if="vote.loading"> <div class="col-md-12 text-center" style="padding-bottom: 2em"> <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> </div> </div> <div ng-if="!vote.loading"> \x3c!-- Coalition Index --\x3e <div class="panel panel-default"> \x3c!-- Default panel contents --\x3e <div class="panel-heading"> <h3 class="panel-title">Vaalirenkaat</h3> </div> <div class="panel-body list-group-item-info"> <p translate> .coalition-index-text </p> </div> \x3c!-- List group --\x3e <div class="list-group"> <a ng-repeat="coalition in vote.coalitions" du-smooth-scroll="{{ \'coalition-\' + coalition.id }}" offset="30" duration="1000" class="list-group-item clickable"> {{ coalition.name }} </a> </div> </div> \x3c!-- /COALITION INDEX --\x3e \x3c!-- SEARCH --\x3e <div class="form-horizontal"> <h2 translate>.search.title</h2> \x3c!-- Search by candidate name --\x3e <div class="row form-group"> <div class="col-sm-6"> <div class="input-group"> <span class="input-group-addon"> <span class="glyphicon glyphicon-user"></span> <span translate>.search.candidate-name</span> </span> <input class="form-control" ng-model="vote.candidate.name"> </div> </div> <div class="col-sm-6"> <span translate>.search.browser-search-tip</span> </div> </div> </div> \x3c!-- /SEARCH --\x3e \x3c!--  COALITIONS --\x3e <section ng-repeat="coalition in vote.coalitions"> <h1 class="coalition-header" id="{{ \'coalition-\' + coalition.id }}" ng-bind="coalition.name"></h1> \x3c!-- #TODO: set visibility by css if coalition has alliance elements --\x3e <p ng-show="vote.candidate.name" translate> .search.when-no-results </p> \x3c!-- ALLIANCES OF COALITION --\x3e <section ng-repeat="alliance in coalition.alliances" ng-show="filteredCandidates.length"> <h2 class="alliance-header" ng-bind="alliance.name" ng-if="coalition.alliance_count > 1"> </h2> \x3c!-- CANDIDATES OF ALLIANCE --\x3e <table class="table table-striped table-hover table-condensed candidate-list"> <thead> <th></th> <th translate>.search.header-number</th> <th translate>.search.header-candidate</th> </thead> <tbody> <tr ng-repeat="c in filteredCandidates = (alliance.candidates | filter:vote.candidate)" ng-class="{ \'info\': vote.selected == c.id }"> <td> \x3c!--\n                      NOTE:\n                      Conditions for disabling candidate selection in `ng-disabled`\n                      must the same what are used in `vote.select()`\n                    --\x3e <input type="radio" ng-disabled="vote.submitting || vote.submitted || vote.votingRight.used" ng-model="vote.selected" ng-value="c.id"> </td> <td ng-click="vote.select(c)">{{ c.number }}</td> <td ng-click="vote.select(c)">{{ c.name }}</td> </tr> </tbody> </table> </section> \x3c!-- /alliances --\x3e </section> \x3c!-- /coalitions --\x3e </div> \x3c!-- /loading --\x3e </form> </div> \x3c!-- col --\x3e </div> \x3c!-- row --\x3e')}]);