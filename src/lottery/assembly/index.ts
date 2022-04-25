import { logging, Context, u128, ContractPromiseBatch, PersistentSet } from "near-sdk-as";

import { AccountId, ONE_NEAR, asNEAR, XCC_GAS } from "../../utils";

@nearBindgen
export class Contract {

  private owner: AccountId;
  private winner: AccountId;
  private last_played: AccountId;
  private active: bool = true;
  private bank: u128 = ONE_NEAR; //for trial
  private lastbid: u128 = ONE_NEAR;
  private totalbid: u128 = ONE_NEAR;
  private power_down: u128 = ONE_NEAR; // near coin required to call capitulate function
  private power: number  = 0;  //when power reaches 10, last bidder wins the game. 
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
   * Bid to win
   * Compete with other people trying to bid more than them. 
   * The last bidder finding the sweet number 10 wins the jackpot accumulated from biddings. 
   * 
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
    
  
    if (this.players.has(signer)) {


     
    } else {
      this.players.add(signer);
    }
    
    

    //power increases by 3 if one bids again, if bidding person changes power decreases by 2. 
    if (this.last_played == signer)
    {
      this.power = this.power+3;
    }
    else{
      this.power = this.power-2;
    }

    logging.log("new monarch power is: "+this.power.toString());

    if (this.power==10) //when power reaches 10, last bidder wins the game. 
    {
      this.winner = signer;
      this.payout();
    }
    
    this.last_played = signer;
  
  }



  @mutateState() //resetting game
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
  
  @mutateState() //showing status of the game, also via script
  status(): void {
    logging.log("last bid is: "+asNEAR(this.lastbid)+" NEAR!");
    logging.log("total bid is: "+asNEAR(this.totalbid)+" NEAR!");
    logging.log(" monarch power is: "+this.power.toString());
  }
 @mutateState() // give away some coin to change power dynamic with another integer. 
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
