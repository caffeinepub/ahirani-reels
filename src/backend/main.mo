import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";

(with migration = Migration.run)
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
  type Otp = Nat;
  type ContentData = {
    id : Text;
    blob : Storage.ExternalBlob;
    name : Text;
    description : Text;
  };

  let users = Map.empty<UserId, Text>();
  var nextAdId = 0;
  let localAds = Map.empty<Nat, LocalAd>();
  let otps = Map.empty<UserId, Otp>();
  let videos = Map.empty<VideoId, ContentData>();

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

  public shared ({ caller }) func adminAddAvatar(_userId : UserId, _avatar : Text) : async () {
    Runtime.trap("Not yet implemented");
  };

  public shared ({ caller }) func addEducation(_userId : UserId, _education : Text) : async () {
    Runtime.trap("Not yet implemented");
  };

  public shared ({ caller }) func sendOtp(_userId : UserId) : async () {
    Runtime.trap("Not yet implemented");
  };

  public shared ({ caller }) func addLocalAd(_userId : UserId, businessName : Text, imageUrl : Text, linkUrl : Text, tagline : Text, durationDays : Nat, startDate : Nat, isActive : Bool) : async () {
    let ad : LocalAd = {
      id = nextAdId.toText();
      businessName;
      imageUrl;
      linkUrl;
      tagline;
      durationDays;
      startDate;
      isActive;
    };
    localAds.add(nextAdId, ad);
    nextAdId += 1;
  };

  public query ({ caller }) func getAllLocalAds() : async [LocalAd] {
    localAds.values().toArray();
  };

  public query ({ caller }) func getActiveLocalAds() : async [LocalAd] {
    localAds.values().toArray().filter(
      func(ad) {
        ad.isActive;
      }
    );
  };
};
