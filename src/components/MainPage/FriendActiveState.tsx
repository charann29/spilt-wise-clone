import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUserData } from "../../redux/reducers/userDataSlice";
import { RootState } from "../../redux/store";
import { setTotalAmount } from "../../redux/reducers/totalAmonutSlice";

interface TotalAmounts {
  [key: string]: number;
}
const FriendActiveState: React.FC = () => {
  const dispatch = useDispatch();
  const groups = useSelector((state: RootState) => state.dummyData.groups);
  const user = useSelector(selectUserData);
  const activeFriend = user.activeFriend;
  const [totalAmountFriend, setTotalAmountFriend] = useState<TotalAmounts>({});
  const allZero = Object.values(totalAmountFriend).every(
    (value) => value === 0
  );

  const handleTime = (groupName: string) => {
    const currentGroup = groups.find((group) => group.groupName === groupName);
    const timeUpdate = currentGroup?.lastUpdate!;
    const month = new Date(timeUpdate)
      .toLocaleString("en-US", { month: "long" })
      .slice(0, 3);
    const day = new Date(timeUpdate).getDate();
    return { month, day };
  };

  const paids = useSelector((state: RootState) => state.paids.paids);
  const paidToCurrentUser = paids?.find(
    (paid) => paid.toWho === user.name
  );
  const calculateTotalAmountFriend = () => {
    if (!groups || !activeFriend) {
      return {};
    }

    const totalAmounts: TotalAmounts = {};
    groups.forEach((group) => {
      let groupTotalAmount = group.howSpent
        ?.filter((howSpent) => howSpent.sharedWith.includes(activeFriend))
        .reduce((sum, item) => {
          const shareAmount = item.cost / (item.sharedWith.length + 1);
          return item.whoPaid === user.name
            ? sum - shareAmount
            : item.whoPaid === activeFriend
            ? sum + shareAmount
            : sum;
        }, 0);

      if(paidToCurrentUser && activeFriend === paidToCurrentUser.whoPaid){
        groupTotalAmount += paidToCurrentUser.howMuchPaid
      }
      
        totalAmounts[group.groupName] = Number(
        groupTotalAmount ? groupTotalAmount.toFixed(2) : 0
      );
    });

    return totalAmounts;
  };



  

  useEffect(() => {
    const totalAmountWithFriend = calculateTotalAmountFriend();
    const totalAmount = Object.values(totalAmountWithFriend).reduce(
      (acc, value) => acc + value,
      0
    );
    setTotalAmountFriend(totalAmountWithFriend);
    dispatch(setTotalAmount(totalAmount));
  }, [activeFriend]);

  return (
    <>
      {user.activeFriend && (
        <div className="container">
          {allZero === false ? (
            <ul className="list-group mt-2 mx-2">
              {groups
                ?.filter((group) => group.friends.includes(activeFriend!))
                .map((group) => (
                  <li
                    key={group.groupName}
                    className="list-group-item message-container mt-1"
                  >
                    <div className="message-date group-name-date">
                      <div>
                        <p>{handleTime(group.groupName).month}</p>
                        <p>{handleTime(group.groupName).day}</p>
                      </div>
                      <div className="group-name-container">
                        <img
                          src="https://secure.splitwise.com/assets/fat_rabbit/group-icon.png"
                          alt="group-icon"
                        ></img>
                        <h6>{group.groupName}</h6>
                      </div>
                    </div>
                    <div
                      className={` ${
                        totalAmountFriend[group.groupName] > 0
                          ? "spent-status-lose"
                          : totalAmountFriend[group.groupName] < 0
                          ? "spent-status-recive"
                          : "price-lose"
                      }`}
                    >
                      <div
                        className={`${
                          totalAmountFriend[group.groupName] < 0
                            ? "lent-you"
                            : totalAmountFriend[group.groupName] > 0
                            ? "you-lent"
                            : "price-zero"
                        }`}
                      >
                        <p>
                          {totalAmountFriend[group.groupName] < 0
                            ? `${activeFriend} owes You`
                            : totalAmountFriend[group.groupName] > 0
                            ? `You owes ${activeFriend}`
                            : "There is no owe"}
                        </p>
                        <strong>
                          ${Math.abs(totalAmountFriend[group.groupName])}
                        </strong>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="settle-point no-expenses">
              <img
                src="https://assets.splitwise.com/assets/fat_rabbit/app/checkmark-circle-ae319506ad7196dc77eede0aed720a682363d68160a6309f6ebe9ce1983e45f0.png"
                className="my-5 w-25"
                alt="checkmark-icon"
              />
              <p>You and {activeFriend} are all settled up.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FriendActiveState;
