import { logging, Context, u128, ContractPromiseBatch, PersistentSet } from "near-sdk-as";

import { AccountId, ONE_NEAR, asNEAR, XCC_GAS } from "../../utils";





@nearBindgen
export class Contract {

  private owner: AccountId;
  private winner: AccountId;
  private last_played: AccountId;
  private active: bool = true;
  private bank: u128 = ONE_NEAR;
  private lastbid: u128 = ONE_NEAR;
  private totalbid: u128 = ONE_NEAR;
  private power_down: u128 = ONE_NEAR;
  private power: number  = 0;
  private power_decrease: number = -1;
 
  
  private players: PersistentSet<AccountId> = new PersistentSet<AccountId>("p");

  constructor(owner: AccountId) {
    this.owner = owner;
  };

  // --------------------------------------------------------------------------
  // Public VIEW methods
  // --------------------------------------------------------------------------

  get_owner(): AccountId {
    return this.owner;
  }

  get_winner(): AccountId {
    return this.winner;
  }

  get_totalbid(): string {
    return asNEAR(this.totalbid) + " NEAR";
  }



  get_has_played(player: AccountId): bool {
    return this.players.has(player);
  }

  get_last_played(): AccountId {
    return this.last_played;
  }





 

  // --------------------------------------------------------------------------
  // Public CHANGE methods
  // --------------------------------------------------------------------------

  /**
   * "Pay to play"
   *
   * First time is free to play and you may win!
   *
   * If you've already played once then any other play costs you a fee.
   * This fee is calculated as 1 NEAR X the square of the total number of unique players
   */
  @mutateState()
  bid(): void {
    assert(this.active, this.winner + " won" + ". Please reset the game.");
    assert(Context.attachedDeposit >= this.lastbid, "You should bid higher than last bid"+ this.lastbid.toString());
    this.lastbid=Context.attachedDeposit;
    this.totalbid=u128.add(this.totalbid, this.lastbid);
    const signer = Context.sender;
    logging.log("last bid is: "+asNEAR(this.lastbid)+" NEAR!");
    logging.log("total bid is: "+asNEAR(this.totalbid)+" NEAR!");
    
    // if you've played before then you have to pay extra
    if (this.players.has(signer)) {
      //const fee = this.fee();
     // assert(Context.attachedDeposit >= fee, this.generate_fee_message(fee));
      //this.increase_pot();

      // if it's your first time then you may win for the price of gas
    } else {
      this.players.add(signer);
    }
    
    

    
    if (this.last_played == signer)
    {
      this.power = this.power+3;
    }
    else{
      this.power = this.power-2;
    }

    logging.log("new monarch power is: "+this.power.toString());

    if (this.power==10)
    {
      this.winner = signer;
      this.payout();
    }
    
    this.last_played = signer;
  
  }



  @mutateState()
  reset(): void {
    this.assert_self();
    this.players.clear();
    this.winner = "";
    this.last_played = "";
    
    this.active = true;
    this.lastbid= ONE_NEAR;
    this.totalbid= ONE_NEAR;
    this.power=0;
  }
  
  @mutateState()
  status(): void {
    logging.log("last bid is: "+asNEAR(this.lastbid)+" NEAR!");
    logging.log("total bid is: "+asNEAR(this.totalbid)+" NEAR!");
    logging.log(" monarch power is: "+this.power.toString());
  }
 @mutateState()
 capitulate(): void {
  assert(Context.attachedDeposit >= this.power_down, "You should capitulate higher than"+ this.power_down.toString());

    this.power=this.power +this.power_decrease;
    logging.log("new monarch power is: "+this.power.toString());
    
  }
  @mutateState()
  on_payout_complete(): void {
    this.assert_self();
    this.active = false;
    logging.log("game over.");
  }
  // this method is only here for the promise callback,
  // it should never be called directly
  private payout(): void {
    logging.log(this.winner + " won " + this.get_totalbid() + "!");

    if (this.winner.length > 0) {
      const to_winner = ContractPromiseBatch.create(this.winner);
      const self = Context.contractName

      // transfer payout to winner
      to_winner.transfer(this.totalbid);

      // receive confirmation of payout before setting game to inactive
      to_winner.then(self).function_call("on_payout_complete", "{}", u128.Zero, XCC_GAS);
    }
  }
  private assert_self(): void {
    const caller = Context.predecessor
    const self = Context.contractName
    assert(caller == self, "Only this contract may call itself");
  }
}
