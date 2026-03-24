import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import List "mo:core/List";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";


actor {
  type UserId = Nat;
  type VideoId = Nat;
  type LocalAd = {
    id : Text;
    businessName : Text;
    imageUrl : Text;
    linkUrl : Text;
    tagline : Text;
    durationDays : Nat;
    startDate : Nat;
    isActive : Bool;
  };

  let users = Map.empty<UserId, Text>();
  var nextAdId = 0;
  let localAds = Map.empty<Nat, LocalAd>();
  let otps = Map.empty<UserId, Nat>();
  let videos = Map.empty<VideoId, ContentData>();
  var paymentSettings : ?Text = null;
  var appVersion : ?Text = null;

  public type ContentData = {
    id : Text;
    blob : Storage.ExternalBlob;
    name : Text;
    description : Text;
  };

  include MixinStorage();

  public query ({ caller }) func getUser(_userId : UserId) : async [UserId] {
    users.toArray().map(func((id, _username)) { id });
  };

  public shared ({ caller }) func adminAddUser(userId : UserId, username : Text) : async () {
    users.add(userId, username);
  };

  public shared ({ caller }) func addContent(_userId : UserId, name : Text, description : Text, blob : Storage.ExternalBlob) : async () {
    let contentId = videos.size().toText();
    let contentData = {
      id = contentId;
      name;
      description;
      blob;
    };
    videos.add(videos.size(), contentData);
  };

  public shared ({ caller }) func setAdminPaymentSettings(json : Text) : async () {
    paymentSettings := ?json;
  };

  public query ({ caller }) func getAdminPaymentSettings() : async Text {
    switch (paymentSettings) {
      case (?settings) { settings };
      case (null) { "" };
    };
  };

  public shared ({ caller }) func setAppVersion(version : Text) : async () {
    appVersion := ?version;
  };

  public query ({ caller }) func getAppVersion() : async Text {
    switch (appVersion) {
      case (?ver) { ver };
      case (null) { "" };
    };
  };
};
