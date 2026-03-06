import Map "mo:core/Map";
import Storage "blob-storage/Storage";

module {
  type ContentData = {
    id : Text;
    name : Text;
    description : Text;
    blob : Storage.ExternalBlob;
  };
  type OldActor = {
    users : Map.Map<Nat, Text>;
    videos : Map.Map<Nat, ContentData>;
  };
  type NewActor = {
    users : Map.Map<Nat, Text>;
    videos : Map.Map<Nat, ContentData>;
    localAds : Map.Map<Nat, { id : Text; businessName : Text; imageUrl : Text; linkUrl : Text; tagline : Text; durationDays : Nat; startDate : Nat; isActive : Bool }>;
  };

  public func run(old : OldActor) : NewActor {
    { old with localAds = Map.empty<Nat, { id : Text; businessName : Text; imageUrl : Text; linkUrl : Text; tagline : Text; durationDays : Nat; startDate : Nat; isActive : Bool }>() };
  };
};
