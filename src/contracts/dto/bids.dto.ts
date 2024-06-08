import { ObjectId } from "mongodb";

export interface BidsDto {
  id_auction?: ObjectId;
  id_user: ObjectId;
  bid: number;
  highest: true;
  returned: false;
}
