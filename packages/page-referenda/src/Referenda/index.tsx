// Copyright 2017-2022 @polkadot/app-referenda authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { PalletReferenda, PalletVote, ReferendaGroup } from '../types';

import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

import AddPreimage from '@polkadot/app-preimages/Preimages/Add';
import { Button, Dropdown } from '@polkadot/react-components';
import { useAccounts } from '@polkadot/react-hooks';

import { useTranslation } from '../translate';
import useReferenda from '../useReferenda';
import useSummary from '../useSummary';
import Group from './Group';
import Submit from './Submit';
import Summary from './Summary';

export { useCounterNamed as useCounter } from '../useCounter';

interface Props {
  className?: string;
  members?: string[];
  palletReferenda: PalletReferenda;
  palletVote: PalletVote;
  ranks?: BN[];
}

function Referenda ({ className, members, palletReferenda, palletVote, ranks }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { allAccounts } = useAccounts();
  const [grouped, tracks] = useReferenda(palletReferenda);
  const summary = useSummary(palletReferenda, grouped);
  const [trackSelected, setTrackSelected] = useState(-1);

  const trackOpts = useMemo(
    () => [{ text: t<string>('All active/available tracks'), value: -1 }].concat(
      grouped
        .map(({ trackId, trackName }) => ({
          text: trackName,
          value: trackId ? trackId.toNumber() : -1
        }))
        .filter((v): v is { text: string, value: number } => !!v.text)
    ),
    [grouped, t]
  );

  const filtered = useMemo(
    () => (
      trackSelected === -1
        ? grouped
        : grouped.filter(({ trackId }) => !!trackId && trackId.eqn(trackSelected))
    ) || [{ referenda: [] }],
    [grouped, trackSelected]
  );

  const isMember = useMemo(
    () => !members || allAccounts.some((a) => members.includes(a)),
    [allAccounts, members]
  );

  return (
    <div className={className}>
      <Summary summary={summary} />
      <Button.Group>
        <Dropdown
          className='topDropdown'
          label={t<string>('selected track')}
          onChange={setTrackSelected}
          options={trackOpts}
          value={trackSelected}
        />
        <AddPreimage />
        <Submit
          isMember={isMember}
          members={members}
          palletReferenda={palletReferenda}
          tracks={tracks}
        />
      </Button.Group>
      {filtered.map(({ key, referenda, trackId, trackName }: ReferendaGroup) => (
        <Group
          isMember={isMember}
          key={key}
          members={members}
          palletReferenda={palletReferenda}
          palletVote={palletVote}
          ranks={ranks}
          referenda={referenda}
          trackId={trackId}
          trackName={trackName}
          tracks={tracks}
        />
      ))}
    </div>
  );
}

export default React.memo(styled(Referenda)`
  .ui--Dropdown.topDropdown {
    min-width: 25rem;
    padding-left: 0;

    > label {
      left: 1.55rem !important;
    }
  }
`);
