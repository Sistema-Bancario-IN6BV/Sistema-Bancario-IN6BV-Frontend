import React from 'react';
import '../../../styles/credit-card.css';

export const CreditCardItem = ({ account, accountOwner, statusBadgeClass }) => {
  // Mock image based on account id
  const randomBgId = ((account.accountNumber ? parseInt(account.accountNumber.toString().slice(-1)) : 0) % 6) + 1;
  const currentCardBackground = randomBgId;
  
  // Format mask
  // If account number is like 10087152099526, just add spaces
  const cardNumber = account.accountNumber 
    ? account.accountNumber.toString().match(/.{1,4}/g)?.join(' ') ?? account.accountNumber
    : '#### #### #### ####';

  const cardName = accountOwner 
    ? `${accountOwner.name || ''} ${accountOwner.surname || ''}`.trim() 
    : account.externalUserId || 'FULL NAME';

  return (
    <div className="card-item relative">
      <div className="card-item__side -front">
        <div className="card-item__cover">
          <img
            src={`https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/${currentCardBackground}.jpeg`}
            className="card-item__bg"
            alt="bg"
          />
        </div>
        
        <div className="card-item__wrapper">
          <div className="card-item__top">
            <img 
              src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/chip.png" 
              className="card-item__chip" 
              alt="chip"
            />
            <div className="card-item__type">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide ${statusBadgeClass(
                  account.status
                )} absolute top-[-10px] right-[-10px] z-10 m-0`}
                style={{ position: 'static' }}
              >
                {account.status ?? "-"}
              </span>
              <img 
                src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/visa.png" 
                alt="type" 
                className="card-item__typeImg"
              />
            </div>
          </div>
          <div className="card-item__number">
            {cardNumber}
          </div>
          <div className="card-item__content">
            <div className="card-item__info">
              <div className="card-item__holder">Usuario vinculado</div>
              <div className="card-item__name">{cardName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
