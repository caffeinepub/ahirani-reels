import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  type UserId = Nat;
  type VideoId = Nat;
  type Otp = Nat;
  type ContentData = {
    id : Text;
    blob : Storage.ExternalBlob;
    name : Text;
    description : Text;
  };

  let users = Map.empty<UserId, Text>();
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

  public query ({ caller }) func getContent(_userId : UserId, id : VideoId) : async ?ContentData {
    videos.get(id);
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
};

