# near-kingofthehill
Near project where users are bidding near to get number #1 spot in king of the hill mini game. Use smart arithmetics to be the last one to win the total prize. 
## King of the hill, bidding game forked from lottery example given my NEAR education 
//Have all the dependencies given in lottery given in github repo: https://github.com/Learn-NEAR/NCD.L1.sample--lottery
//Many original files have not ben changed, due to show reference
//Loom video here: https://www.loom.com/share/e004da54df3044c2ac398423cc9da839
//Damn feeling good i have finally done this
//Here is what i have done for loom video: 
--> yarn
--> yarn build:release
--> near dev-deploy ./build/release/lottery.wasm
--> export CONTRACT=<dev-id>
--> near login (preferring 2 logins)
--> near call $CONTRACT init '{"owner":"<your-account-id.testnet>"}' --accountId $CONTRACT
--> near call $CONTRACT init '{"owner":"humman.testnet"}' --accountId $CONTRACT 
//( for any user change to user.testnet ), from now on example accounts humman.testnet and humman2.testnets are used for bidding
--> near call $CONTRACT bid --account_id humman2.testnet --amount 1.01
near call $CONTRACT bid --account_id humman.testnet --amount 1.01
--> near call $CONTRACT capitulate --account_id humman2.testnet --amount 1
  
FUCNTIONS AND MECHANICS
bid()
default last bid is 1 NEAR, your bid should be always higher or equal to last bid of any player.
  
reset()
can reset game anytime, especially when it ends.
 
capitulate()
A power mechanics is added. When last player reaches 10 monarch powers he/she wins and gains all the bids accumulated. capitulate is a function that reduces monarch power by 1, with money burned just for that.
  
on_payout_complete()
Triggers after payout is complete, deactivating game mode and thus causing assertment in bid()
  
private payout()
This functions pays the signer, thus the last person who reaches to 10 monarch points. Getting all the juicy prize.
  
There are other view functions i havent talked in loom video, but i believe they are self explaitonary. Scripts are also from lottery-example. 
  
Was very fun, and i am glad NEAR is supporting potential devs. I want to be part of the future.  
  
