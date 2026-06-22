import { forwardRef } from 'react';
import useAppStore from '../../store/appStore';
import { getCharacterFromSelections, getPlayerTag, CHARACTER_MAP } from '../../utils/characters';

/**
 * ThumbnailCanvas — Composant de rendu d'une miniature pour UN set.
 * Dimensions : 1280×720 (format YouTube 16/9).
 * Ce composant est capturé par html2canvas.
 *
 * Il est forwardRef pour permettre à ThumbnailCanvas d'être ciblé.
 */
const ThumbnailCanvas = forwardRef(function ThumbnailCanvas({ set }, ref) {
  const { layoutImage, characterOverrides } = useAppStore();

  if (!set) return null;

  const slot1 = set.slots?.[0];
  const slot2 = set.slots?.[1];
  const entrant1 = slot1?.entrant;
  const entrant2 = slot2?.entrant;

  const p1Tag = getPlayerTag(entrant1);
  const p2Tag = getPlayerTag(entrant2);

  const score1 = slot1?.standing?.stats?.score?.value ?? '-';
  const score2 = slot2?.standing?.stats?.score?.value ?? '-';

  // Personnages
  const selections1 = entrant1?.participants?.[0]?.selections ?? [];
  const selections2 = entrant2?.participants?.[0]?.selections ?? [];
  const apiChar1    = getCharacterFromSelections(selections1, entrant1?.id);
  const apiChar2    = getCharacterFromSelections(selections2, entrant2?.id);

  const override1 = characterOverrides[set.id]?.p1CharId
    ? CHARACTER_MAP[characterOverrides[set.id].p1CharId] : null;
  const override2 = characterOverrides[set.id]?.p2CharId
    ? CHARACTER_MAP[characterOverrides[set.id].p2CharId] : null;

  const char1 = override1 ?? apiChar1;
  const char2 = override2 ?? apiChar2;

  const isWinner1 = set.winnerId === entrant1?.id;
  const roundText = set.fullRoundText ?? `Round ${set.round}`;

  return (
    <div
      ref={ref}
      id={`thumbnail-canvas-${set.id}`}
      style={{
        width: '1280px',
        height: '720px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        backgroundColor: '#0a0a0f',
        flexShrink: 0,
      }}
    >
      {/* Background layout */}
      {layoutImage && (
        <img
          src={layoutImage}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
      )}

      {/* Overlay gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: layoutImage
          ? 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)'
          : 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #1a1a2e 100%)',
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px',
        gap: '20px',
      }}>
        {/* Phase badge */}
        <div style={{
          background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
          borderRadius: '999px',
          padding: '8px 24px',
          color: 'white',
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          {roundText}
        </div>

        {/* VS Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '60px',
          width: '100%',
        }}>
          {/* Player 1 */}
          <PlayerBlock
            tag={p1Tag}
            char={char1}
            score={score1}
            isWinner={isWinner1}
            align="right"
          />

          {/* VS */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{
              fontSize: '80px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>
              VS
            </div>
            <div style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>
              {score1} – {score2}
            </div>
          </div>

          {/* Player 2 */}
          <PlayerBlock
            tag={p2Tag}
            char={char2}
            score={score2}
            isWinner={!isWinner1}
            align="left"
          />
        </div>

        {/* Branding */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '30px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '12px',
          fontWeight: 500,
        }}>
          SmashThumbnailGenerator
        </div>
      </div>
    </div>
  );
});

/**
 * Bloc d'un joueur (tag + personnage + score)
 */
function PlayerBlock({ tag, char, score, isWinner, align }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: align === 'right' ? 'flex-end' : 'flex-start',
      gap: '8px',
      flex: 1,
      maxWidth: '420px',
    }}>
      {isWinner && (
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#22d3ee',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
        }}>
          ▲ WINNER
        </span>
      )}
      <div style={{
        fontSize: tag.length > 12 ? '42px' : '56px',
        fontWeight: 900,
        color: isWinner ? '#22d3ee' : '#e2e8f0',
        textShadow: isWinner
          ? '0 0 30px rgba(34,211,238,0.5)'
          : '0 2px 10px rgba(0,0,0,0.8)',
        textAlign: align,
        lineHeight: 1.1,
        wordBreak: 'break-word',
      }}>
        {tag}
      </div>
      {char && (
        <div style={{
          fontSize: '22px',
          color: 'rgba(255,255,255,0.6)',
          fontWeight: 500,
          fontStyle: 'italic',
        }}>
          {char.name}
        </div>
      )}
    </div>
  );
}

export default ThumbnailCanvas;
