import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { LazyImage } from '../components/LazyImage';

interface BlogPageProps {
  onNavigate: (section: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = () => {
  const { blogPosts, blogComments, submitComment } = useData();
  const [activePostId, setActivePostId] = useState<string | null>(null);

  // Comment submission form state
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [commentError, setCommentError] = useState('');

  // Public view shows only 'Published' posts
  const publishedPosts = blogPosts.filter(p => p.status === 'Published');
  const activePost = activePostId ? publishedPosts.find(p => p.id === activePostId) : null;

  // Comments for active post: public shows only 'Approved' comments.
  const activePostComments = activePost
    ? blogComments.filter(c => c.postId === activePost.id && c.status === 'Approved')
    : [];

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost) return;
    if (!authorName || !authorEmail || !commentContent) {
      setCommentError('Please fill in all fields to submit a comment.');
      return;
    }

    setIsSubmittingComment(true);
    setCommentError('');

    const res = await submitComment(activePost.id, authorName, authorEmail, commentContent);
    setIsSubmittingComment(false);

    if (res.success) {
      setCommentSubmitted(true);
      setAuthorName('');
      setAuthorEmail('');
      setCommentContent('');
    } else {
      setCommentError(res.error || 'Failed to submit comment.');
    }
  };

  if (activePost) {
    return (
      <div id="blog-single-post" className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        {/* Back to Blog Button */}
        <button
          onClick={() => {
            setActivePostId(null);
            setCommentSubmitted(false);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] hover:underline transition-colors mb-12 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Dispatches</span>
        </button>

        {/* Post Header */}
        <div className="mb-12">
          <span className="text-xs font-semibold tracking-widest text-[var(--color-gold)] uppercase block mb-3">
            {activePost.publishedAt ? new Date(activePost.publishedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }) : 'Dispatch'}
          </span>

          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-heading)] tracking-tight leading-tight mb-6">
            {activePost.title}
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-body)]/85 leading-relaxed font-normal">
            {activePost.excerpt}
          </p>
        </div>

        {/* Featured Image */}
        {activePost.featuredImage && (
          <div className="rounded-xs overflow-hidden aspect-video mb-12 bg-black">
            <LazyImage
              src={activePost.featuredImage}
              alt={activePost.title}
              containerClassName="w-full h-full"
              className="w-full h-full object-cover filter brightness-95"
            />
          </div>
        )}

        {/* Article Body */}
        <div
          className="prose prose-invert max-w-none text-base text-[var(--text-body)]/85 font-light leading-relaxed space-y-6 pb-16 border-b border-[var(--border-color)]"
          dangerouslySetInnerHTML={{ __html: activePost.content }}
        />

        {/* Post Comments Section */}
        <div id="post-comments" className="pt-16">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-color)]">
            <h3 className="text-xl sm:text-2xl font-serif font-medium text-[var(--text-heading)]">
              Responses ({activePostComments.length})
            </h3>
            <span className="text-xs font-sans text-[var(--text-body)]/50 uppercase tracking-wider">
              Moderated
            </span>
          </div>

          {/* List of Approved Comments */}
          {activePostComments.length === 0 ? (
            <p className="text-sm text-[var(--text-body)]/50 font-light mb-12">
              No public responses published for this entry yet.
            </p>
          ) : (
            <div className="divide-y divide-[var(--border-color)] mb-14">
              {activePostComments.map((comment) => (
                <div key={comment.id} className="py-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans font-medium text-sm text-[var(--text-heading)]">
                      {comment.authorName}
                    </span>
                    <span className="text-xs text-[var(--text-body)]/50">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-body)]/80 font-light leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Leave a Comment Form */}
          <div className="pt-8 border-t border-[var(--border-color)]">
            <h4 className="text-xl font-serif font-medium text-[var(--text-heading)] mb-2">
              Join the Conversation
            </h4>
            <p className="text-xs text-[var(--text-body)]/60 font-light mb-6">
              Email addresses remain private and will not be displayed.
            </p>

            {commentSubmitted ? (
              <div className="py-8 text-center border border-[var(--border-color)] rounded-xs">
                <CheckCircle className="w-8 h-8 text-[var(--color-gold)] mx-auto mb-2" />
                <span className="font-serif font-medium text-base text-[var(--text-heading)] block mb-1">
                  Submitted for Review
                </span>
                <p className="text-xs text-[var(--text-body)]/70 font-light">
                  Your response is currently queued for editorial moderation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                {commentError && (
                  <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-xs text-xs text-red-300">
                    {commentError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans tracking-wider uppercase text-[var(--color-gold)] mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Name"
                      className="w-full px-4 py-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--color-gold)] rounded-xs text-sm text-[var(--text-heading)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans tracking-wider uppercase text-[var(--color-gold)] mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder="email@domain.com"
                      className="w-full px-4 py-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--color-gold)] rounded-xs text-sm text-[var(--text-heading)] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans tracking-wider uppercase text-[var(--color-gold)] mb-1.5">
                    Response
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write your response..."
                    className="w-full px-4 py-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--color-gold)] rounded-xs text-sm text-[var(--text-heading)] outline-none resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="px-6 py-3 bg-[var(--color-gold)] text-[#192c45] font-semibold text-xs tracking-wider uppercase rounded-sm hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isSubmittingComment ? 'Submitting...' : 'Submit Response'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="blog-index" className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="mb-16 sm:mb-20 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase mb-3">
          Studio Notes
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-heading)] tracking-tight mb-4">
          Dispatches & Articles
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-body)]/85 leading-relaxed max-w-2xl font-normal">
          Articles on production methodology, commercial storytelling, and industry craftsmanship directly from our directors.
        </p>
      </div>

      {/* Published Posts - Editorial List Layout */}
      {publishedPosts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-[var(--text-body)]/50">
            New articles currently in preparation.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-color)] border-t border-b border-[var(--border-color)]">
          {publishedPosts.map((post) => (
            <article
              key={post.id}
              id={`blog-item-${post.id}`}
              onClick={() => setActivePostId(post.id)}
              className="group py-10 sm:py-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-start cursor-pointer"
            >
              {/* Left meta / date column */}
              <div className="md:col-span-3">
                <span className="text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] block mb-1">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Published'}
                </span>
                <span className="text-xs text-[var(--text-body)]/60 block">
                  Studio Article
                </span>
              </div>

              {/* Center content column */}
              <div className="md:col-span-6">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-heading)] group-hover:text-[var(--color-gold)] transition-colors mb-3">
                  {post.title}
                </h2>
                <p className="text-sm text-[var(--text-body)]/80 font-normal leading-relaxed line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                <span className="text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] group-hover:underline transition-colors inline-flex items-center gap-1">
                  Read Article →
                </span>
              </div>

              {/* Right thumbnail column */}
              {post.featuredImage && (
                <div className="md:col-span-3 aspect-[16/10] overflow-hidden rounded-xs bg-[#090909]">
                  <LazyImage
                    src={post.featuredImage}
                    alt={post.title}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90 group-hover:brightness-100"
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
