"use client";

/**
 * 社内FAQ — 4ペイン雛形（`/faq`）。
 *
 * 仮置き・後回し（実装時に差し替え）:
 * - 重複・類似Qのマージ方針は未実装（手で整理する前提）
 * - 「聞かれた」Slack 連携は未実装（手動カウンタのみ）
 * - 履歴UIなし（更新日・更新者メタのみ。JSON 上の文字列を表示）
 * - 関連の自動候補はタグ重なりの単純スコア（ルール差し替え前提）
 * - 認証・ACL・永続化なし（クライアント state のみ。リロードで初期データに戻る）
 */

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { BookMarked, Plus, Search } from "lucide-react";

import type { FaqData, FaqDomain, FaqEntry } from "@/lib/faq-schema";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Pane1Toggle } from "@/components/workspace/Pane1Toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InlineFieldRow,
  InlineSelectField,
  InlineTextareaField,
  InlineTextField,
} from "@/components/primitives";

type FaqWorkspaceProps = {
  initialData: FaqData;
};

function domainName(domains: FaqDomain[], id: string) {
  return domains.find((d) => d.id === id)?.name ?? id;
}

function matchesSearch(entry: FaqEntry, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const hay = [
    entry.question,
    entry.answer,
    ...entry.tags,
  ]
    .join("\n")
    .toLowerCase();
  return hay.includes(s);
}

function tagOverlapScore(a: FaqEntry, b: FaqEntry) {
  const bt = new Set(b.tags);
  return a.tags.filter((t) => bt.has(t)).length;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function FaqWorkspace({ initialData }: FaqWorkspaceProps) {
  const [domains] = useState<FaqDomain[]>(initialData.domains);
  const [entries, setEntries] = useState<FaqEntry[]>(initialData.entries);
  const [selectedDomainId, setSelectedDomainId] = useState<string>(
    initialData.domains[0]?.id ?? "",
  );
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createQuestion, setCreateQuestion] = useState("");
  const [createAnswer, setCreateAnswer] = useState("");
  const [createDomainId, setCreateDomainId] = useState(
    initialData.domains[0]?.id ?? "",
  );
  const [createTags, setCreateTags] = useState("");

  const domainNames = useMemo(() => domains.map((d) => d.name), [domains]);

  const selectedEntry = useMemo(
    () => entries.find((e) => e.id === selectedEntryId) ?? null,
    [entries, selectedEntryId],
  );

  const filteredForPane2 = useMemo(() => {
    const q = searchQuery.trim();
    if (q) {
      return entries
        .filter((e) => matchesSearch(e, q))
        .sort((a, b) => b.viewCount - a.viewCount);
    }
    return entries
      .filter((e) => e.primaryDomainId === selectedDomainId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [entries, searchQuery, selectedDomainId]);

  const popular = useMemo(
    () => [...entries].sort((a, b) => b.viewCount - a.viewCount).slice(0, 3),
    [entries],
  );

  const suggestedRelated = useMemo(() => {
    if (!selectedEntry) return [];
    return entries
      .filter((e) => e.id !== selectedEntry.id)
      .map((e) => ({ e, score: tagOverlapScore(selectedEntry, e) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.e.viewCount - a.e.viewCount)
      .slice(0, 5)
      .map((x) => x.e);
  }, [entries, selectedEntry]);

  const selectQuestion = useCallback(
    (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      setSelectedDomainId(entry.primaryDomainId);
      setSelectedEntryId(id);
      setSearchQuery("");
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, viewCount: e.viewCount + 1 } : e,
        ),
      );
    },
    [entries],
  );

  const patchEntry = useCallback((id: string, patch: Partial<FaqEntry>) => {
    if (patch.primaryDomainId && id === selectedEntryId) {
      setSelectedDomainId(patch.primaryDomainId);
    }
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              ...patch,
              updatedAt: todayIso(),
            }
          : e,
      ),
    );
  }, [selectedEntryId]);

  const bumpAsked = useCallback(() => {
    if (!selectedEntryId) return;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === selectedEntryId
          ? { ...e, askedCount: e.askedCount + 1, updatedAt: todayIso() }
          : e,
      ),
    );
  }, [selectedEntryId]);

  const handleCreate = useCallback(() => {
    const q = createQuestion.trim();
    const a = createAnswer.trim();
    if (!q || !a || !createDomainId) return;
    const tags = createTags
      .split(/[,、]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const id = `faq-${Date.now()}`;
    const day = todayIso();
    const next: FaqEntry = {
      id,
      primaryDomainId: createDomainId,
      tags,
      question: q,
      answer: a,
      relatedEntryIds: [],
      manualLinks: [],
      createdAt: day,
      updatedAt: day,
      updatedBy: "管理者（仮）",
      viewCount: 0,
      askedCount: 0,
    };
    setEntries((prev) => [...prev, next]);
    setSelectedDomainId(createDomainId);
    setSelectedEntryId(id);
    setCreateQuestion("");
    setCreateAnswer("");
    setCreateTags("");
    setCreateOpen(false);
  }, [createAnswer, createDomainId, createQuestion, createTags]);

  const breadcrumbDomain =
    searchQuery.trim() && selectedEntry
      ? "検索から移動"
      : domainName(domains, selectedDomainId);

  return (
    <SidebarProvider
      defaultOpen
      className="h-screen w-full overflow-hidden bg-background text-foreground"
    >
      <Sidebar
        collapsible="icon"
        className="border-r border-sidebar-border [&_[data-slot=sidebar-container]]:bg-sidebar"
      >
        <SidebarHeader className="border-b border-sidebar-border p-0">
          <div className="flex h-12 items-center justify-between gap-2 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[state=expanded]:px-5">
            <div className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:hidden">
              <BookMarked className="size-4 shrink-0 text-sidebar-foreground" />
              <h2 className="truncate text-sm font-semibold text-sidebar-foreground">
                {initialData.workspace.name}
              </h2>
            </div>
            <Pane1Toggle />
          </div>
        </SidebarHeader>
        <SidebarContent className="px-1 py-3 group-data-[collapsible=icon]:hidden">
          <SidebarGroup className="px-1">
            <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase">
              分野
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {domains.map((d) => {
                  const active =
                    !searchQuery.trim() && d.id === selectedDomainId;
                  const count = entries.filter(
                    (e) => e.primaryDomainId === d.id,
                  ).length;
                  return (
                    <SidebarMenuItem key={d.id}>
                      <SidebarMenuButton
                        isActive={active}
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedDomainId(d.id);
                          setSelectedEntryId(null);
                        }}
                      >
                        <span className="truncate">{d.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                          {count}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="flex min-w-0 flex-col bg-background">
        <header className="flex h-12 shrink-0 flex-wrap items-center gap-2 border-b border-border bg-background px-3">
          <Breadcrumb
            className="min-w-0 flex-1 overflow-hidden"
            aria-label="パンくず"
          >
            <BreadcrumbList className="flex-nowrap text-[11px]">
              <BreadcrumbItem className="shrink-0">
                <BreadcrumbPage className="font-medium">
                  {breadcrumbDomain}
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate font-medium">
                  {selectedEntry?.question ?? "質問を選択"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="relative flex min-w-[12rem] max-w-xs flex-1 items-center sm:max-w-md">
            <Search className="pointer-events-none absolute left-2 size-4 text-muted-foreground" />
            <Input
              aria-label="キーワード検索"
              placeholder="キーワード（全分野）"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 bg-card pl-8"
            />
          </div>

          <Button
            type="button"
            variant={adminMode ? "default" : "outline"}
            size="sm"
            onClick={() => setAdminMode((v) => !v)}
          >
            管理者
          </Button>

          {adminMode ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setCreateOpen(true)}
              >
                <Plus />
                新規FAQ
              </Button>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>新規FAQ</DialogTitle>
                    <DialogDescription>
                      即公開モデル（保存したら一覧に反映）の仮実装です。
                    </DialogDescription>
                  </DialogHeader>
                  <FieldGroup className="flex flex-col gap-4">
                    <Field>
                      <FieldLabel htmlFor="faq-new-q">質問</FieldLabel>
                      <Input
                        id="faq-new-q"
                        value={createQuestion}
                        onChange={(e) => setCreateQuestion(e.target.value)}
                        className="bg-card"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="faq-new-a">回答</FieldLabel>
                      <Textarea
                        id="faq-new-a"
                        value={createAnswer}
                        onChange={(e) => setCreateAnswer(e.target.value)}
                        className="bg-card min-h-28"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>主分野</FieldLabel>
                      <Select
                        value={createDomainId}
                        onValueChange={(v) => {
                          if (v) setCreateDomainId(v);
                        }}
                      >
                        <SelectTrigger className="h-8 bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="faq-new-tags">
                        タグ（カンマ区切り）
                      </FieldLabel>
                      <Input
                        id="faq-new-tags"
                        value={createTags}
                        onChange={(e) => setCreateTags(e.target.value)}
                        placeholder="勤怠, 在宅"
                        className="bg-card"
                      />
                    </Field>
                  </FieldGroup>
                  <DialogFooter>
                    <DialogClose
                      render={<Button variant="outline">キャンセル</Button>}
                    />
                    <Button
                      onClick={handleCreate}
                      disabled={!createQuestion.trim() || !createAnswer.trim()}
                    >
                      追加
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : null}

          <Link
            href="/"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            採用WS
          </Link>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Pane 2 */}
          <section className="flex w-[280px] shrink-0 flex-col border-r border-border bg-background">
            <div className="flex shrink-0 flex-col gap-2 border-b border-border px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                よく見られている
              </p>
              <div className="flex flex-col gap-1.5">
                {popular.map((e) => (
                  <Button
                    key={e.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto justify-start gap-2 py-1.5 font-normal"
                    onClick={() => selectQuestion(e.id)}
                  >
                    <span className="line-clamp-2 min-w-0 flex-1 text-left text-xs">
                      {e.question}
                    </span>
                    <Badge variant="secondary" className="shrink-0 tabular-nums">
                      {e.viewCount}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2">
              <h2 className="truncate text-sm font-semibold">
                {searchQuery.trim() ? "検索結果" : "質問一覧"}
              </h2>
            </div>
            <ScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col gap-1 p-2">
                {filteredForPane2.length === 0 ? (
                  <p className="px-2 py-4 text-sm text-muted-foreground">
                    該当する質問がありません。
                  </p>
                ) : (
                  filteredForPane2.map((e) => {
                    const active = e.id === selectedEntryId;
                    return (
                      <Button
                        key={e.id}
                        type="button"
                        variant={active ? "secondary" : "ghost"}
                        size="sm"
                        className="h-auto min-h-10 w-full flex-col items-stretch gap-1 py-2 font-normal"
                        onClick={() => selectQuestion(e.id)}
                        aria-current={active ? "page" : undefined}
                      >
                        <span className="line-clamp-2 text-left text-xs leading-snug">
                          {e.question}
                        </span>
                        {searchQuery.trim() ? (
                          <Badge variant="outline" className="w-fit text-[10px]">
                            {domainName(domains, e.primaryDomainId)}
                          </Badge>
                        ) : null}
                      </Button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </section>

          {/* Pane 3 */}
          <section className="min-w-0 flex-1 bg-canvas">
            <ScrollArea className="h-full">
              <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
                {!selectedEntry ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        左の一覧から質問を選ぶか、検索してください
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      検索で選ぶと、主分野に合わせてペイン1の文脈へ追従します（仮実装）。
                    </CardContent>
                  </Card>
                ) : adminMode ? (
                  <div className="flex flex-col gap-6" key={selectedEntry.id}>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-semibold leading-snug text-foreground">
                        編集（管理者）
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        履歴UIは後回し。更新すると更新日が今日に置き換わります（仮）。
                      </p>
                    </div>
                    <dl className="flex flex-col gap-4 text-sm">
                      <InlineFieldRow label="質問">
                        <InlineTextField
                          key={`${selectedEntry.id}-q-${selectedEntry.question}`}
                          value={selectedEntry.question}
                          onSave={(v) =>
                            patchEntry(selectedEntry.id, { question: v })
                          }
                          ariaLabel="質問"
                        />
                      </InlineFieldRow>
                      <InlineFieldRow label="主分野">
                        <InlineSelectField
                          value={domainName(
                            domains,
                            selectedEntry.primaryDomainId,
                          )}
                          options={domainNames}
                          onSave={(name) => {
                            const d = domains.find((x) => x.name === name);
                            if (d)
                              patchEntry(selectedEntry.id, {
                                primaryDomainId: d.id,
                              });
                          }}
                          ariaLabel="主分野"
                        />
                      </InlineFieldRow>
                      <InlineFieldRow label="タグ（カンマ区切りで入力）">
                        <InlineTextField
                          key={`${selectedEntry.id}-tags-${selectedEntry.tags.join()}`}
                          value={selectedEntry.tags.join(", ")}
                          onSave={(v) =>
                            patchEntry(selectedEntry.id, {
                              tags: v
                                .split(/[,、]/)
                                .map((t) => t.trim())
                                .filter(Boolean),
                            })
                          }
                          ariaLabel="タグ"
                          placeholder="例: 勤怠, 在宅"
                        />
                      </InlineFieldRow>
                      <InlineFieldRow label="回答">
                        <InlineTextareaField
                          key={`${selectedEntry.id}-a-${selectedEntry.answer.slice(0, 24)}`}
                          value={selectedEntry.answer}
                          onSave={(v) =>
                            patchEntry(selectedEntry.id, { answer: v })
                          }
                          ariaLabel="回答"
                        />
                      </InlineFieldRow>
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" onClick={bumpAsked}>
                        聞かれた +1
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <p>登録日: {selectedEntry.createdAt}</p>
                      <p>更新日: {selectedEntry.updatedAt}</p>
                      {selectedEntry.updatedBy ? (
                        <p>更新者: {selectedEntry.updatedBy}</p>
                      ) : null}
                      <p className="tabular-nums">
                        閲覧カウント: {selectedEntry.viewCount} / 聞かれた:{" "}
                        {selectedEntry.askedCount}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {domainName(domains, selectedEntry.primaryDomainId)}
                        </Badge>
                        {selectedEntry.tags.map((t) => (
                          <Badge key={t} variant="outline">
                            {t}
                          </Badge>
                        ))}
                      </div>
                      <h2 className="text-xl font-semibold leading-snug text-foreground">
                        {selectedEntry.question}
                      </h2>
                    </div>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                          {selectedEntry.answer}
                        </div>
                      </CardContent>
                    </Card>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <p>登録日: {selectedEntry.createdAt}</p>
                      <p>更新日: {selectedEntry.updatedAt}</p>
                      {selectedEntry.updatedBy ? (
                        <p>更新者: {selectedEntry.updatedBy}</p>
                      ) : null}
                      <p className="tabular-nums">
                        閲覧: {selectedEntry.viewCount} / 聞かれた（手動集計）:{" "}
                        {selectedEntry.askedCount}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </section>

          {/* Pane 4 */}
          <aside className="flex w-[min(100%,360px)] shrink-0 flex-col border-l border-border bg-background sm:w-[360px]">
            <header className="flex h-12 shrink-0 items-center border-b border-border px-3">
              <h2 className="truncate text-sm font-semibold">関連情報</h2>
            </header>
            <ScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col gap-6 p-4">
                {!selectedEntry ? (
                  <p className="text-sm text-muted-foreground">
                    質問を選ぶと関連が表示されます。
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        手動リンク
                      </p>
                      {selectedEntry.manualLinks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          リンクなし
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-2">
                          {selectedEntry.manualLinks.map((l) => (
                            <li key={l.href}>
                              <a
                                href={l.href}
                                target="_blank"
                                rel="noreferrer"
                                className={buttonVariants({
                                  variant: "link",
                                  className:
                                    "h-auto justify-start p-0 text-left text-sm font-normal",
                                })}
                              >
                                {l.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        関連する別の質問
                      </p>
                      <ul className="flex flex-col gap-1">
                        {selectedEntry.relatedEntryIds.map((rid) => {
                          const rel = entries.find((e) => e.id === rid);
                          if (!rel) return null;
                          return (
                            <li key={rid}>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto w-full justify-start py-1.5 text-left font-normal"
                                onClick={() => selectQuestion(rel.id)}
                              >
                                <span className="line-clamp-3 text-xs">
                                  {rel.question}
                                </span>
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        自動候補（タグ重なり・仮）
                      </p>
                      {suggestedRelated.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          候補なし
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-1">
                          {suggestedRelated.map((e) => (
                            <li key={e.id}>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto w-full justify-start py-1.5 text-left font-normal"
                                onClick={() => selectQuestion(e.id)}
                              >
                                <span className="line-clamp-2 text-xs">
                                  {e.question}
                                </span>
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </aside>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
