"use client";

import { motion } from "framer-motion";
import {
  User,
  Heart,
  Users,
  UserCircle,
  Crown,
  Baby,
  Sparkles
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  avatar?: string;
  isConnected?: boolean;
  email?: string;
}

interface FamilyTreeVisualizationProps {
  members: FamilyMember[];
  currentUser: {
    name: string;
    avatar?: string;
  };
  onMemberClick?: (member: FamilyMember) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const getRelationshipIcon = (relationship: string) => {
  const rel = relationship.toLowerCase();
  if (rel.includes("spouse") || rel.includes("partner")) return Heart;
  if (rel.includes("parent") || rel.includes("mother") || rel.includes("father")) return Crown;
  if (rel.includes("child") || rel.includes("son") || rel.includes("daughter")) return Baby;
  if (rel.includes("sibling") || rel.includes("brother") || rel.includes("sister")) return Users;
  if (rel.includes("grand")) return Sparkles;
  return User;
};

const getRelationshipColor = (relationship: string) => {
  const rel = relationship.toLowerCase();
  if (rel.includes("spouse") || rel.includes("partner")) return "from-rose-400 to-pink-500";
  if (rel.includes("parent") || rel.includes("mother") || rel.includes("father")) return "from-amber-400 to-orange-500";
  if (rel.includes("child")) return "from-sky-400 to-blue-500";
  if (rel.includes("sibling")) return "from-violet-400 to-purple-500";
  if (rel.includes("grand")) return "from-emerald-400 to-teal-500";
  return "from-sage to-sage-dark";
};

const groupByRelationship = (members: FamilyMember[]) => {
  const groups: Record<string, FamilyMember[]> = {
    parents: [],
    spouse: [],
    siblings: [],
    children: [],
    grandparents: [],
    other: [],
  };

  members.forEach((member) => {
    const rel = member.relationship.toLowerCase();
    if (rel.includes("spouse") || rel.includes("partner") || rel.includes("wife") || rel.includes("husband")) {
      groups.spouse.push(member);
    } else if (rel.includes("father") || rel.includes("mother") || rel.includes("parent")) {
      groups.parents.push(member);
    } else if (rel.includes("sibling") || rel.includes("brother") || rel.includes("sister")) {
      groups.siblings.push(member);
    } else if (rel.includes("child") || rel.includes("son") || rel.includes("daughter")) {
      groups.children.push(member);
    } else if (rel.includes("grand")) {
      groups.grandparents.push(member);
    } else {
      groups.other.push(member);
    }
  });

  return groups;
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const MemberNode = ({
  member,
  delay = 0,
  onClick,
}: {
  member: FamilyMember;
  delay?: number;
  onClick?: () => void;
}) => {
  const Icon = getRelationshipIcon(member.relationship);
  const gradientColor = getRelationshipColor(member.relationship);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, type: "spring" }}
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="relative">
        {/* Glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-20 blur-xl rounded-full`} />

        {/* Avatar */}
        <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${gradientColor} p-0.5 shadow-lg`}>
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircle className="w-12 h-12 text-sage/50" />
            )}
          </div>
        </div>

        {/* Connection status */}
        {member.isConnected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center"
          >
            <Icon className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>

      {/* Name and relationship */}
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-foreground truncate max-w-[100px]">
          {member.name}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {member.relationship}
        </p>
      </div>
    </motion.div>
  );
};

const ConnectionLine = ({
  direction = "vertical",
  length = 40,
  delay = 0
}: {
  direction?: "vertical" | "horizontal" | "diagonal-left" | "diagonal-right";
  length?: number;
  delay?: number;
}) => {
  const getPath = () => {
    switch (direction) {
      case "horizontal":
        return `M 0,20 H ${length}`;
      case "diagonal-left":
        return `M ${length},0 Q ${length/2},20 0,40`;
      case "diagonal-right":
        return `M 0,0 Q ${length/2},20 ${length},40`;
      default:
        return `M 20,0 V ${length}`;
    }
  };

  const width = direction === "vertical" ? 40 : length;
  const height = direction === "vertical" ? length : 40;

  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      width={width}
      height={height}
      className="overflow-visible"
    >
      <motion.path
        d={getPath()}
        fill="none"
        stroke="hsl(var(--sage))"
        strokeWidth="2"
        strokeDasharray="4 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.5 }}
      />
    </motion.svg>
  );
};

const RelationshipGroup = ({
  title,
  members,
  onMemberClick,
  delay = 0,
}: {
  title: string;
  members: FamilyMember[];
  onMemberClick?: (member: FamilyMember) => void;
  delay?: number;
}) => {
  if (members.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <span className="text-xs uppercase tracking-wider text-sage/60 mb-4">
        {title}
      </span>
      <div className="flex gap-6 flex-wrap justify-center">
        {members.map((member, idx) => (
          <MemberNode
            key={member.id}
            member={member}
            delay={delay + 0.1 * idx}
            onClick={() => onMemberClick?.(member)}
          />
        ))}
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function FamilyTreeVisualization({
  members,
  currentUser,
  onMemberClick,
}: FamilyTreeVisualizationProps) {
  const groups = groupByRelationship(members);
  const hasParents = groups.parents.length > 0 || groups.grandparents.length > 0;
  const hasChildren = groups.children.length > 0;
  const hasSiblings = groups.siblings.length > 0;
  const hasSpouse = groups.spouse.length > 0;

  return (
    <div className="relative w-full py-8 overflow-x-auto">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sage/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex flex-col items-center gap-2 min-w-[600px] px-8">
        {/* Grandparents Row */}
        {groups.grandparents.length > 0 && (
          <>
            <RelationshipGroup
              title="Grandparents"
              members={groups.grandparents}
              onMemberClick={onMemberClick}
              delay={0}
            />
            <ConnectionLine length={30} delay={0.2} />
          </>
        )}

        {/* Parents Row */}
        {groups.parents.length > 0 && (
          <>
            <RelationshipGroup
              title="Parents"
              members={groups.parents}
              onMemberClick={onMemberClick}
              delay={0.3}
            />
            <ConnectionLine length={30} delay={0.5} />
          </>
        )}

        {/* Current User + Spouse + Siblings Row */}
        <div className="flex items-center gap-8">
          {/* Siblings (left side) */}
          {hasSiblings && (
            <>
              <div className="flex gap-4">
                {groups.siblings.map((member, idx) => (
                  <MemberNode
                    key={member.id}
                    member={member}
                    delay={0.6 + idx * 0.1}
                    onClick={() => onMemberClick?.(member)}
                  />
                ))}
              </div>
              <ConnectionLine direction="horizontal" length={50} delay={0.7} />
            </>
          )}

          {/* Current User (Center) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
            className="relative"
          >
            {/* Highlight ring */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-sage/30 blur-lg"
              style={{ width: 110, height: 110, top: -5, left: -5 }}
            />

            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-sage to-sage-dark p-1 shadow-xl shadow-sage/30">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-14 h-14 text-sage" />
                )}
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-sm font-bold text-sage-dark">
                {currentUser.name}
              </p>
              <p className="text-xs text-sage">You</p>
            </div>
          </motion.div>

          {/* Spouse (right side) */}
          {hasSpouse && (
            <>
              <ConnectionLine direction="horizontal" length={50} delay={0.7} />
              <div className="flex gap-4">
                {groups.spouse.map((member, idx) => (
                  <MemberNode
                    key={member.id}
                    member={member}
                    delay={0.8 + idx * 0.1}
                    onClick={() => onMemberClick?.(member)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Children Row */}
        {hasChildren && (
          <>
            <ConnectionLine length={30} delay={0.9} />
            <RelationshipGroup
              title="Children"
              members={groups.children}
              onMemberClick={onMemberClick}
              delay={1}
            />
          </>
        )}

        {/* Other relationships */}
        {groups.other.length > 0 && (
          <div className="mt-8 pt-8 border-t border-sage/20 w-full">
            <RelationshipGroup
              title="Other Family & Friends"
              members={groups.other}
              onMemberClick={onMemberClick}
              delay={1.2}
            />
          </div>
        )}
      </div>

      {/* Empty state */}
      {members.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Users className="w-16 h-16 text-sage/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No family members yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Start building your family tree by inviting your loved ones to your trusted circle.
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default FamilyTreeVisualization;
